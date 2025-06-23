import moment from "moment";
import * as Sentry from "@sentry/node";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Setting from "../../models/Setting";
import Queue from "../../models/Queue";
import ShowTicketService from "./ShowTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import { verifyMessage } from "../../utils/message/handlers";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import ShowUserService from "../UserServices/ShowUserService";
import { isNil } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import { checkOutOfHours } from "../../utils/message/handlers";
import CreateMessageService from "../MessageServices/CreateMessageService";

interface TicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  chatbot?: boolean;
  queueOptionId?: number;
  whatsappId?: number;
  useIntegration?: boolean;
  integrationId?: number | null;
  promptId?: number | null;
  forceClose?: boolean;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  companyId: number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

interface MessageData {
  id: string;
  ticketId: number;
  body: string;
  fromMe: boolean;
  read: boolean;
  mediaType: string;
  ack: number;
  dataJson: string;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {
  try {
    const { status, forceClose } = ticketData;
    let { queueId, userId, whatsappId } = ticketData;
    let chatbot: boolean | null = ticketData.chatbot || false;
    let queueOptionId: number | null = ticketData.queueOptionId || null;
    let promptId: number | null = ticketData.promptId || null;
    let useIntegration: boolean | null = ticketData.useIntegration || false;
    let integrationId: number | null = ticketData.integrationId || null;

    const io = getIO();

    const key = "userRating";
    const setting = await Setting.findOne({
      where: {
        companyId,
        key
      }
    });

    const ticket = await ShowTicketService(ticketId, companyId);
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId,
      companyId,
      whatsappId: ticket.whatsappId
    });

    if (isNil(whatsappId)) {
      whatsappId = ticket.whatsappId;
    }

    await SetTicketMessagesAsRead(ticket);

    const oldStatus = ticket.status;
    const oldUserId = ticket.user?.id;
    const oldQueueId = ticket.queueId;

    if (oldStatus === "closed" || Number(whatsappId) !== ticket.whatsappId) {
      // let otherTicket = await Ticket.findOne({
      //   where: {
      //     contactId: ticket.contactId,
      //     status: { [Op.or]: ["open", "pending", "group"] },
      //     whatsappId
      //   }
      // });
      // if (otherTicket) {
      //     otherTicket = await ShowTicketService(otherTicket.id, companyId)

      //     await ticket.update({status: "closed"})

      //     io.to(oldStatus).emit(`company-${companyId}-ticket`, {
      //       action: "delete",
      //       ticketId: ticket.id
      //     });

      //     return { ticket: otherTicket, oldStatus, oldUserId }
      // }
      await CheckContactOpenTickets(ticket.contact.id, whatsappId);
      chatbot = null;
      queueOptionId = null;
    }

    if (status !== undefined && ["closed"].indexOf(status) > -1) {
      // Se for fechamento forçado, não tenta enviar mensagens
      if (!forceClose) {
        const { completionMessage, ratingMessage } = await ShowWhatsAppService(
          ticket.whatsappId,
          companyId
        );

        // Só envia mensagens de avaliação/conclusão para tickets individuais
        if (!ticket.isGroup) {
        if (setting?.value === "enabled" && ticket.contact.automation) {
          if (ticketTraking.ratingAt == null) {
            const ratingTxt = ratingMessage || "";
            if (ratingTxt) {
              let bodyRatingMessage = `\u200e${ratingTxt}\n\n`;
              bodyRatingMessage +=
                "Por favor, avalie nosso serviço respondendo com uma nota de *1 a 3*, onde:\n\n🙁 *1* - _Insatisfeito_\n😊 *2* - _Satisfeito_\n🌟 *3* - _Muito Satisfeito_\n\nSua opinião é muito importante para continuarmos melhorando! 🙌\n\nAguardamos sua resposta. Grato! 💛";
              await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });
            } else {
              let bodyRatingMessage = "Por favor, avalie nosso serviço respondendo com uma nota de *1 a 3*, onde:\n🙁 *1* - _Insatisfeito_\n😊 *2* - _Satisfeito_\n🌟 *3* - _Muito Satisfeito_\n\nSua opinião é muito importante para continuarmos melhorando! 🙌\n\nAguardamos sua resposta. Grato! 💛";
              await SendWhatsAppMessage({ body: bodyRatingMessage, ticket });
            }
            await ticketTraking.update({
              ratingAt: moment().toDate()
            });

            io.to(`company-${ticket.companyId}-open`)
              .to(`queue-${ticket.queueId}-open`)
              .to(ticketId.toString())
              .emit(`company-${ticket.companyId}-ticket`, {
                action: "delete",
                ticketId: ticket.id
              });

            return { ticket, oldStatus, oldUserId };
          }
          ticketTraking.ratingAt = moment().toDate();
          ticketTraking.rated = false;
        }

        if (!isNil(completionMessage) && completionMessage !== "") {
          const body = `\u200e${completionMessage}`;
          const sentMessage = await SendWhatsAppMessage({ body, ticket });
          
          const messageData: MessageData = {
            id: sentMessage.key.id,
            ticketId: ticket.id,
            body: body,
            fromMe: true,
            read: false,
            mediaType: "chat",
            ack: 0,
            dataJson: JSON.stringify(sentMessage)
          };
          
          await CreateMessageService({ messageData, companyId });
          }
        }
      }

      // Limpa todas as configurações do ticket ao fechar
      await ticket.update({
        status: "closed",
        queueId: null,
        chatbot: null,
        queueOptionId: null,
        userId: null,
        useIntegration: false,
        promptId: null,
        integrationId: null,
        typebotStatus: false,
        typebotSessionId: null,
        isBot: false
      });

      ticketTraking.finishedAt = moment().toDate();
      ticketTraking.whatsappId = ticket.whatsappId;
      ticketTraking.userId = ticket.userId;
    }

    // CORREÇÃO: Adicionado await no update do ticketTraking
    if (status !== undefined && ["pending"].indexOf(status) > -1) {
      await ticketTraking.update({
        whatsappId,
        queuedAt: moment().toDate(),
        startedAt: null,
        userId: null
      });
    }

    if (queueId !== undefined && queueId !== null) {
      await ticketTraking.update({
        queuedAt: moment().toDate()
      });
    }

    const settingsTransfTicket = await ListSettingsServiceOne({ 
      companyId, 
      key: "sendMsgTransfTicket" 
    });

    // CORREÇÃO: Parênteses balanceados e estrutura condicional melhorada
    if (settingsTransfTicket?.value === "enabled") {
      // Mensagem de transferencia da FILA
      if (oldQueueId !== queueId && oldUserId === userId && !isNil(oldQueueId) && !isNil(queueId)) {
        const queue = await Queue.findByPk(queueId);
        const wbot = await GetTicketWbot(ticket);
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}*\naguarde, já vamos te atender!`;

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: msgtxt }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      }
      else 
        // Mensagem de transferencia do ATENDENTE
        if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId)) {
        const wbot = await GetTicketWbot(ticket);
        const nome = await ShowUserService(ticketData.userId);
        const msgtxt = `*Mensagem automática*:\nFoi transferido para o atendente *${nome.name}*\naguarde, já vamos te atender!`;

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: msgtxt }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      }
      else 
        // Mensagem de transferencia do ATENDENTE e da FILA
        if (oldUserId !== userId && !isNil(oldUserId) && !isNil(userId) && oldQueueId !== queueId && !isNil(oldQueueId) && !isNil(queueId)) {
        const wbot = await GetTicketWbot(ticket);
        const queue = await Queue.findByPk(queueId);
        const nome = await ShowUserService(ticketData.userId);
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}* e contará com a presença de *${nome.name}*\naguarde, já vamos te atender!`;

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: msgtxt }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      } 
      else if (oldUserId !== undefined && isNil(userId) && oldQueueId !== queueId && !isNil(queueId)) {
        const queue = await Queue.findByPk(queueId);
        const wbot = await GetTicketWbot(ticket);
        const msgtxt = `*Mensagem automática*:\nVocê foi transferido para o departamento *${queue?.name}*\naguarde, já vamos te atender!`;

        const queueChangedMessage = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: msgtxt }
        );
        await verifyMessage(queueChangedMessage, ticket, ticket.contact);
      }
    }

    if (ticketData.userId) {
      const user = await ShowUserService(ticketData.userId);
      if (user.profile !== "admin") {
        const userQueueIds = user.queues.map(queue => queue.id);
        if (ticket.queueId && !userQueueIds.includes(ticket.queueId)) {
          throw new AppError("ERR_NO_QUEUE_PERMISSION");
        }
      }
    }

    await ticket.update({
      status,
      queueId,
      userId,
      whatsappId,
      chatbot,
      queueOptionId
    });

    await ticket.reload();

    if (ticket.status !== "pending") {
      io.to(`company-${ticket.companyId}-${ticket.status}`)
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "update",
          ticket,
          traking: "updated ticket"
        });
    } else {
      io.to(`company-${ticket.companyId}-${ticket.status}`)
        .to("notification")
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "update",
          ticket,
          traking: "updated ticket"
        });
    }

    if (status !== undefined && ["open"].indexOf(status) > -1) {
      await ticketTraking.update({
        startedAt: moment().toDate(),
        ratingAt: null,
        rated: false,
        whatsappId,
        userId: ticket.userId
      });
    }

    await ticketTraking.save();

    if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
      io.to(`company-${companyId}-${oldStatus}`)
        .to(`queue-${ticket.queueId}-${oldStatus}`)
        .to(`user-${oldUserId}`)
        .to(`company-${companyId}-open`)
        .to(`company-${companyId}-pending`)
        .to(`queue-${ticket.queueId}-open`)
        .to(`queue-${ticket.queueId}-pending`)
        .emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticketId: ticket.id
        });

      await new Promise(resolve => setTimeout(resolve, 100));

      if (ticket.status !== "closed") {
        io.to(`company-${companyId}-${ticket.status}`)
          .to(`company-${companyId}-notification`)
          .to(`queue-${ticket.queueId}-${ticket.status}`)
          .to(`queue-${ticket.queueId}-notification`)
          .to(ticketId.toString())
          .to(`user-${ticket?.userId}`)
          .to(`user-${oldUserId}`)
          .emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket
          });
      } else {
        io.to(`company-${companyId}-closed`)
          .to(`queue-${ticket.queueId}-closed`)
          .to(ticketId.toString())
          .emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket
          });
      }
    }

    return { ticket, oldStatus, oldUserId };
  } catch (err) {
    Sentry.captureException(err);
    throw new AppError(err.message);
  }
};

export default UpdateTicketService;
