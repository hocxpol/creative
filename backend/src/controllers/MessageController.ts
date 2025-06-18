import { Request, Response, RequestHandler } from "express";
import AppError from "../errors/AppError";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import formatBody from "../helpers/Mustache";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import { Op } from "sequelize";
type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
  closeTicket?: true;
};
type ForwardMessageData = {
	messageId: string;
	targetChatIds: number[];
};

interface RequestUser {
	id: string;
	name: string;
	profile: string;
	companyId: number;
}

type RequestWithUser = Request & {
	user: RequestUser;
	params: {
		whatsappId?: string;
		messageId?: string;
		[key: string]: string | undefined;
	};
	body: MessageData | ForwardMessageData;
	files?: any[];
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;
  const queues: number[] = [];

  if (profile !== "admin") {
    // Encaminhar
    // const user = await User.findByPk(req.user.id, {
      const user = await (User as any).findByPk(req.user.id, {
      include: [{ model: Queue, as: "queues" }]
    });
    user.queues.forEach(queue => {
      queues.push(queue.id);
    });
  }

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId,
    queues
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as any[];
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    // Ordena os arquivos baseado na ordem recebida
    const orderedMedias = medias.map((media, index) => {
      const order = parseInt(req.body[`order[${index}]`] || index.toString());
      return { media, order };
    }).sort((a, b) => a.order - b.order);

    // Envia os arquivos na ordem correta
    await Promise.all(
      orderedMedias.map(async ({ media }) => {
        await SendWhatsAppMedia({ 
          media, 
          ticket, 
          body: Array.isArray(body) ? body[media.order] : body 
        });
      })
    );
  } else {
    const send = await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const { message, ticket } = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  // Emite o evento de atualização para todos os canais relevantes
  io.to(message.ticketId.toString())
    .to(`company-${companyId}-${ticket.status}`)
    .to(`company-${companyId}-notification`)
    .to(`company-${companyId}-open`)
    .to(`company-${companyId}-pending`)
    .to(`company-${companyId}-mainchannel`)
    .to(`queue-${ticket.queueId}-${ticket.status}`)
    .to(`queue-${ticket.queueId}-notification`)
    .emit(`company-${companyId}-ticket`, {
    action: "update",
      ticket,
      ticketId: ticket.id,
      message
  });

  // Emite também o evento appMessage para manter compatibilidade
  io.to(message.ticketId.toString())
    .to(`company-${companyId}-${ticket.status}`)
    .to(`company-${companyId}-notification`)
    .to(`company-${companyId}-mainchannel`)
    .emit(`company-${companyId}-appMessage`, {
      action: "update",
    message,
      ticket,
      ticketId: ticket.id
  });

  return res.send();
};

export const send = async (req: RequestWithUser, res: Response): Promise<Response> => {
	const { whatsappId } = req.params;
	const messageData = req.body as MessageData;
	const medias = req.files as any[];

  try {
    const whatsapp = await (Whatsapp as any).findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }

    if (messageData.number === undefined) {
      throw new Error("O número é obrigatório");
    }

    const numberToTest = messageData.number;
    const body = messageData.body;

    const companyId = whatsapp.companyId;

    const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
    const number = CheckValidNumber.jid.replace(/\D/g, "");
    const profilePicUrl = await GetProfilePicUrl(
      number,
      companyId
    );
    const existingContact = await Contact.findOne({
      where: { number, companyId }
    });

    const contactData = {
      name: existingContact ? existingContact.name : `Contato ${number}`,
      number,
      profilePicUrl,
      isGroup: false,
      companyId
    };

    const contact = await CreateOrUpdateContactService(contactData);
    const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, 0, companyId);

    if (medias) {
      await Promise.all(
        medias.map(async (media: any) => {
          await req.app.get("queues").messageQueue.add(
            "SendMessage",
            {
              whatsappId,
              data: {
                number,
                body: body ? formatBody(body, contact) : media.originalname,
                mediaPath: media.path,
                fileName: media.originalname
              }
            },
            { removeOnComplete: true, attempts: 3 }
          );
        })
      );
    } else {
      await SendWhatsAppMessage({ body: formatBody(body, contact), ticket });

      await (ticket as any).update({
        lastMessage: body,
      });
    }

    if (messageData.closeTicket) {
      setTimeout(async () => {
        await UpdateTicketService({
          ticketId: ticket.id,
          ticketData: { status: "closed" },
          companyId
        });
      }, 1000);
    }
    
    SetTicketMessagesAsRead(ticket);

    return res.send({ mensagem: "Mensagem enviada" });
  } catch (err: any) {
    if (Object.keys(err).length === 0) {
      throw new AppError(
        "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
      );
    } else {
      throw new AppError(err.message);
    }
  }
};

export const forward = async (req: RequestWithUser, res: Response): Promise<Response> => {
	const forwardData = req.body as ForwardMessageData;
	const { messageId, targetChatIds } = forwardData;
	const { companyId, profile } = req.user;

	// Validação inicial dos parâmetros
	if (!messageId) {
		throw new AppError("ID da mensagem é obrigatório");
	}

	if (!targetChatIds) {
		throw new AppError("IDs dos chats de destino são obrigatórios");
	}

	if (!Array.isArray(targetChatIds)) {
		throw new AppError("IDs dos chats de destino devem ser um array");
	}

	if (targetChatIds.length === 0) {
		throw new AppError("Selecione pelo menos um chat para encaminhar");
	}

	// Busca e valida a mensagem original
	const originalMessage = await (Message as any).findByPk(messageId.toString(), {
		include: [
			{ model: Ticket, as: "ticket" },
			{ model: Contact, as: "contact" }
		]
	});

	if (!originalMessage) {
		throw new AppError("Mensagem original não encontrada");
	}

	// Verifica se o usuário tem acesso à mensagem
	if (originalMessage.companyId !== companyId) {
		throw new AppError("Você não tem permissão para encaminhar esta mensagem");
	}

	// Verifica se a mensagem não está deletada
	if (originalMessage.isDeleted) {
		throw new AppError("Não é possível encaminhar uma mensagem deletada");
	}

	const forwardedMessages = [];
	const io = getIO();

	for (const chatId of targetChatIds) {
		// Verifica existência e acesso ao chat de destino
		const chat = await ShowTicketService(chatId, companyId);
		
		if (!chat) {
			throw new AppError(`Chat ${chatId} não encontrado`);
		}

		// Verifica se o chat está ativo
		if (chat.status === "closed") {
			throw new AppError(`Não é possível encaminhar para um chat fechado: ${chatId}`);
		}

		// Envia a mensagem via WhatsApp primeiro
		const sentMessage = await SendWhatsAppMessage({
			body: originalMessage.body,
			ticket: chat,
			isForwarded: true,
			originalMessage: originalMessage
		});

		// Aguarda e verifica se a mensagem foi processada pelo listener
		let forwardedMessage = null;
		let attempts = 0;
		const maxAttempts = 5;
		
		while (!forwardedMessage && attempts < maxAttempts) {
			await new Promise(resolve => setTimeout(resolve, 1000));
			forwardedMessage = await (Message as any).findOne({
				where: {
					ticketId: chatId,
					dataJson: {
						[Op.like]: `%${sentMessage.key.id}%`
					}
				}
			});
			attempts++;
		}

		if (forwardedMessage) {
			// Atualiza a mensagem com os dados de encaminhamento
			await forwardedMessage.update({
				isForwarded: true,
				forwardedFrom: messageId
			});

			forwardedMessages.push(forwardedMessage);

			// Atualiza o ticket com a última mensagem
			await (chat as any).update({ lastMessage: originalMessage.body });

			// Emite evento de nova mensagem apenas para o chat de destino
			io.to(chatId.toString()).emit(`company-${companyId}-appMessage`, {
				action: "create",
				message: forwardedMessage
			});
		}
	}

	// Marca a mensagem original como encaminhada
	await originalMessage.update({
		isForwarded: true,
		forwardedTo: targetChatIds
	});

	return res.status(200).json(forwardedMessages);
};
