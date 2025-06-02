import { proto, WAMessage, WASocket } from "@whiskeysockets/baileys";
import { IMe, Session } from "../../../services/WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import { getIO } from "../../../libs/socket";
import { getBodyMessage, getTypeMessage, getQuotedMessageId, isValidMsg } from "../index";
import { logger } from "../../../utils/logger";
import * as Sentry from "@sentry/node";
import { Op } from "sequelize";
import CreateMessageService from "../../../services/MessageServices/CreateMessageService";
import formatBody from "../../../helpers/Mustache";
import { getContactMessage, verifyContact } from "../../contact";
import ShowWhatsAppService from "../../../services/WhatsappService/ShowWhatsAppService";
import { cacheLayer } from "../../../libs/cache";
import FindOrCreateTicketService from "../../../services/TicketServices/FindOrCreateTicketService";
import { provider } from "../../../services/WbotServices/providers";
import { verifyQueue } from "../../queue";
import FindOrCreateATicketTrakingService from "../../../services/TicketServices/FindOrCreateATicketTrakingService";
import { verifyRating, handleRating } from "../../rating";
import { verifyMediaMessage } from "../../media";
import VerifyCurrentSchedule from "../../../services/CompanyService/VerifyCurrentSchedule";
import { debounce } from "../../../helpers/Debounce";
import moment from "moment";
import { handleOpenAi } from "../../openai";
import ShowQueueIntegrationService from "../../../services/QueueIntegrationServices/ShowQueueIntegrationService";
import { handleMessageIntegration } from "../../integration";
import { handleChartbot } from "../../chatbot";
import { verifyKeyword } from "../../queue/keyword";
import { formatScheduleInfo, formatOutOfHoursMessage, isOutOfHours } from "../../schedule";

import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import Queue from "../../../models/Queue";
import Setting from "../../../models/Setting";
import User from "../../../models/User";
import Contact from "../../../models/Contact";

import Whatsapp from "../../../models/Whatsapp";
import CreateOrUpdateContactService from "../../../services/ContactServices/CreateOrUpdateContactService";
import QueueOption from "../../../models/QueueOption";
import { Sequelize } from "sequelize";
import UpdateTicketService from "../../../services/TicketServices/UpdateTicketService";
import Company from "../../../models/Company";

const messageQueue = new Map();
const processingQueue = new Map();

const sendOutOfHoursMessage = async (
  wbot: Session,
  ticket: Ticket,
  body: string
): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    
    if (processingQueue.has(ticket.id)) {
      return;
    }

    processingQueue.set(ticket.id, true);
    
    if (!messageQueue.has(ticket.id)) {
      messageQueue.set(ticket.id, []);
    }
    
    const message = {
      number: ticket.contact.number,
      isGroup: ticket.isGroup,
      body,
      timestamp: Date.now()
    };
    
    messageQueue.get(ticket.id)?.push(message);

    const messages = messageQueue.get(ticket.id) || [];
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    for (const message of messages) {
      try {
        await wbot.sendMessage(
          `${message.number}@${message.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: message.body }
        );
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    messageQueue.delete(ticket.id);
    processingQueue.delete(ticket.id);
  } catch (error) {
    processingQueue.delete(ticket.id);
  }
};

export const verifyQuotedMessage = async (
    msg: proto.IWebMessageInfo
  ): Promise<Message | null> => {
    if (!msg) return null;
    const quoted = getQuotedMessageId(msg);
  
    if (!quoted) return null;
  
    const quotedMsg = await Message.findOne({
      where: { id: quoted }
    });
  
    if (!quotedMsg) return null;
  
    return quotedMsg;
  };

export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);

  // Verifica se é uma mensagem editada
  const isEdited = msg.message?.protocolMessage?.type === 14 || 
                  !!msg.message?.editedMessage;

  // Extrai o corpo da mensagem
  let body = getBodyMessage(msg);
  
  // Se for uma mensagem editada, extrai o conteúdo editado
  if (isEdited) {
    const editedContent = msg.message.protocolMessage?.editedMessage || 
                        msg.message.editedMessage?.message?.protocolMessage?.editedMessage;
                        
    if (editedContent) {
      body = editedContent.conversation || 
             editedContent.extendedTextMessage?.text ||
             editedContent.imageMessage?.caption ||
             editedContent.videoMessage?.caption ||
             editedContent.documentMessage?.caption ||
             editedContent.documentWithCaptionMessage?.message?.documentMessage?.caption;
    }
  }

  // Verifica se é uma mensagem encaminhada
  const isForwarded = 
    msg.message?.extendedTextMessage?.contextInfo?.isForwarded || 
    msg.message?.imageMessage?.contextInfo?.isForwarded ||
    msg.message?.videoMessage?.contextInfo?.isForwarded ||
    msg.message?.documentMessage?.contextInfo?.isForwarded ||
    msg.message?.audioMessage?.contextInfo?.isForwarded ||
    msg.message?.stickerMessage?.contextInfo?.isForwarded ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage?.contextInfo?.isForwarded ||
    msg.message?.viewOnceMessage?.message?.imageMessage?.contextInfo?.isForwarded ||
    msg.message?.viewOnceMessage?.message?.videoMessage?.contextInfo?.isForwarded ||
    (msg.message?.extendedTextMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.imageMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.videoMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.documentMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.audioMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.stickerMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.documentWithCaptionMessage?.message?.documentMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.viewOnceMessage?.message?.imageMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    (msg.message?.viewOnceMessage?.message?.videoMessage?.contextInfo?.forwardingScore || 0) > 0 ||
    msg.message?.protocolMessage?.type === 3 ||
    msg.message?.protocolMessage?.type === 4 ||
    msg.message?.protocolMessage?.type === 5 ||
    msg.message?.protocolMessage?.type === 6;

  // Log detalhado para debug
  logger.info('Message processing details:', {
    messageId: msg.key.id,
    isEdited,
    isForwarded,
    body,
    ticketId: ticket.id,
    contactId: contact.id,
    messageType: getTypeMessage(msg),
    protocolMessageType: msg.message?.protocolMessage?.type,
    contextInfo: {
      extendedText: {
        isForwarded: msg.message?.extendedTextMessage?.contextInfo?.isForwarded,
        forwardingScore: msg.message?.extendedTextMessage?.contextInfo?.forwardingScore
      },
      image: {
        isForwarded: msg.message?.imageMessage?.contextInfo?.isForwarded,
        forwardingScore: msg.message?.imageMessage?.contextInfo?.forwardingScore
      },
      video: {
        isForwarded: msg.message?.videoMessage?.contextInfo?.isForwarded,
        forwardingScore: msg.message?.videoMessage?.contextInfo?.forwardingScore
      },
      document: {
        isForwarded: msg.message?.documentMessage?.contextInfo?.isForwarded,
        forwardingScore: msg.message?.documentMessage?.contextInfo?.forwardingScore
      },
      audio: {
        isForwarded: msg.message?.audioMessage?.contextInfo?.isForwarded,
        forwardingScore: msg.message?.audioMessage?.contextInfo?.forwardingScore
      },
      sticker: {
        isForwarded: msg.message?.stickerMessage?.contextInfo?.isForwarded,
        forwardingScore: msg.message?.stickerMessage?.contextInfo?.forwardingScore
      }
    },
    editedMessage: msg.message?.protocolMessage?.editedMessage,
    rawMessage: JSON.stringify(msg.message, null, 2)
  });

  const messageData = {
    id: isEdited ? (msg.message.protocolMessage?.key?.id || msg.key.id) : msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: isEdited ? (
      // Se for mensagem editada, verifica se tem mídia no conteúdo editado ou na mensagem original
      msg.message?.protocolMessage?.editedMessage?.imageMessage ? "image" :
      msg.message?.protocolMessage?.editedMessage?.videoMessage ? "video" :
      msg.message?.protocolMessage?.editedMessage?.documentMessage ? "document" :
      msg.message?.protocolMessage?.editedMessage?.audioMessage ? "audio" :
      msg.message?.imageMessage ? "image" :  // Preserva mídia da mensagem original
      msg.message?.videoMessage ? "video" :
      msg.message?.documentMessage ? "document" :
      msg.message?.audioMessage ? "audio" :
      getTypeMessage(msg)
    ) : getTypeMessage(msg),
    mediaUrl: isEdited ? (
      // Preserva a URL da mídia mesmo em mensagens editadas
      msg.message?.protocolMessage?.editedMessage?.imageMessage?.url ||
      msg.message?.protocolMessage?.editedMessage?.videoMessage?.url ||
      msg.message?.protocolMessage?.editedMessage?.documentMessage?.url ||
      msg.message?.protocolMessage?.editedMessage?.audioMessage?.url ||
      msg.message?.imageMessage?.url ||  // Mantém URL da mídia original
      msg.message?.videoMessage?.url ||
      msg.message?.documentMessage?.url ||
      msg.message?.audioMessage?.url
    ) : undefined,
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
    isEdited,
    isForwarded
  };

  try {
    // Atualiza o ticket com a última mensagem
    await ticket.update({
      lastMessage: body
    });

    // Cria ou atualiza a mensagem no banco
    const message = await CreateMessageService({ messageData, companyId: ticket.companyId });
    logger.info(`Message processed successfully: ${message.id}`);

    // Reabre ticket fechado se a mensagem não for do remetente
    if (!msg.key.fromMe && ticket.status === "closed") {
      await ticket.update({ 
        status: "pending",
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
      await ticket.reload({
        include: [
          { model: Queue, as: "queue" },
          { model: User, as: "user" },
          { model: Contact, as: "contact" }
        ]
      });

      io.to(`company-${ticket.companyId}-closed`)
        .to(`queue-${ticket.queueId}-closed`)
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });

      io.to(`company-${ticket.companyId}-${ticket.status}`)
        .to(`queue-${ticket.queueId}-${ticket.status}`)
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }
  } catch (error) {
    logger.error(`Error processing message: ${error}`);
    Sentry.captureException(error);
    throw error;
  }
};

export const checkOutOfHours = async (
  ticket: Ticket,
  scheduleType: Setting,
  currentSchedule: any
): Promise<{ isOutOfHours: boolean; message: string | null }> => {
  try {
    // Se o ticket já está sendo atendido por um usuário, não retorna mensagem de fora do expediente
    if (ticket.userId) {
      return { isOutOfHours: false, message: null };
    }

    // Se não houver configuração de tipo de horário ou se estiver desabilitado, retorna false
    if (!scheduleType || scheduleType.value === "disabled") {
      return { isOutOfHours: false, message: null };
    }

    const now = moment();

    if (scheduleType.value === "company") {
      if (isOutOfHours(currentSchedule)) {
        const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
        const company = await Company.findByPk(ticket.companyId);
        const scheduleInfo = formatScheduleInfo(company.schedules);
        const message = whatsapp?.outOfHoursMessage || null;
        return { 
          isOutOfHours: true, 
          message: formatOutOfHoursMessage(message, scheduleInfo)
        };
      }
      return { isOutOfHours: false, message: null };
    }

    // Se for fila, verifica se o ticket tem fila e se a fila tem configuração de horário
    if (scheduleType.value === "queue" && ticket.queueId) {
      const queue = await Queue.findByPk(ticket.queueId);
      if (!queue) return { isOutOfHours: false, message: null };

      // Se a fila não tiver configuração de horário, retorna false
      if (!queue.schedules || !queue.outOfHoursMessage) {
        return { isOutOfHours: false, message: null };
      }

      const { schedules }: any = queue;
      const weekday = now.format("dddd").toLowerCase();

      const schedule = schedules?.find(s => 
        s.weekdayEn === weekday && 
        s.startTime && 
        s.endTime
      );

      if (schedule) {
        const startTime = moment(schedule.startTime, "HH:mm");
        const endTime = moment(schedule.endTime, "HH:mm");

        if (now.isBefore(startTime) || now.isAfter(endTime)) {
          const scheduleInfo = formatScheduleInfo(schedules);
          return { 
            isOutOfHours: true, 
            message: formatOutOfHoursMessage(queue.outOfHoursMessage, scheduleInfo)
          };
        }
      }
    }

    return { isOutOfHours: false, message: null };
  } catch (error) {
    Sentry.captureException(error);
    return { isOutOfHours: false, message: null };
  }
};

export const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number
): Promise<void> => {
  if (!isValidMsg(msg)) return;

  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    let mediaSent: Message | undefined;

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");
    const msgIsGroupBlock = await Setting.findOne({
      where: {
        companyId,
        key: "CheckMsgIsGroup",
      },
    });

    const bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message?.documentWithCaptionMessage ||
      msg.message.stickerMessage;

    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;

      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard" &&
        msgType !== "contactMessage" &&
        msgType !== "contactsArrayMessage"
      )
        return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }

    if (msgIsGroupBlock?.value === "enabled" && isGroup) return;

    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
      const msgGroupContact = {
        id: grupoMeta.id,
        name: grupoMeta.subject
      };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);
    const contact = await verifyContact(msgContact, wbot, companyId);

    // Processamento específico para vCards
    if (msgType === "contactMessage" || msgType === "vcard") {
      try {
        const vcard = msg.message?.contactMessage?.vcard;
        if (!vcard) {
          logger.warn('vCard não encontrado na mensagem');
          return;
        }

        // Criar ticket temporário para a mensagem primeiro
        const tempTicket = await FindOrCreateTicketService(
          contact,
          whatsapp.id,
          0,
          companyId,
          groupContact
        );

        // Extrair informações do vCard
        const vcardInfo = {
          displayName: msg.message?.contactMessage?.displayName || "Contato",
          vcard: vcard
        };

        // Criar messageData com ticketId já incluído
        const messageData = {
          id: msg.key.id,
          body: JSON.stringify(vcardInfo),  // Enviar como JSON estruturado
          mediaType: "contactMessage",
          mediaUrl: null,
          ack: 0,
          read: true,
          fromMe: msg.key.fromMe,
          contactId: msg.key.fromMe ? undefined : contact.id,
          companyId: companyId,
          isEdited: false,
          isForwarded: false,
          ticketId: tempTicket.id
        };

        await CreateMessageService({ messageData, companyId });
      } catch (error) {
        logger.error('Erro ao processar vCard:', error);
        Sentry.captureException(error);
      }
    }

    // Processamento para múltiplos vCards
    if (msgType === "contactsArrayMessage") {
      try {
        const vcards = msg.message?.contactsArrayMessage?.contacts;
        if (!Array.isArray(vcards)) {
          logger.warn('Array de vCards inválido');
          return;
        }

        // Criar ticket temporário para a mensagem primeiro
        const tempTicket = await FindOrCreateTicketService(
          contact,
          whatsapp.id,
          0,
          companyId,
          groupContact
        );

        // Enviar os vCards formatados
        const formattedVCards = {
          contacts: {
            displayName: "Contatos",
            contacts: vcards.map(contact => ({
              displayName: contact.displayName || "Contato",
              vcard: contact.vcard
            }))
          }
        };

        await wbot.sendMessage(
          `${contact.number}@${tempTicket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          formattedVCards
        );
      } catch (error) {
        logger.error('Erro ao processar múltiplos vCards:', error);
        Sentry.captureException(error);
      }
    }

    let unreadMessages = 0;

    if (msg.key.fromMe) {
      await cacheLayer.set(`contacts:${contact.id}:unreads`, "0");
    } else {
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
      unreadMessages = +unreads + 1;
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}`
      );
    }

    const ticket = await FindOrCreateTicketService(
      contact,
      whatsapp.id,
      unreadMessages,
      companyId,
      groupContact
    );

    // Primeiro, verificar se é uma avaliação
    if (!msg.key.fromMe) {
      const ticketTraking = await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: wbot.id!
      });

      const isRating = ticketTraking !== null && verifyRating(ticketTraking);

      if (isRating) {
        const rate = parseFloat(bodyMessage);
        if (![1, 2, 3].includes(rate)) {
          await wbot.sendMessage(
            `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: "Por favor, responda apenas com 1, 2 ou 3 para avaliar nosso atendimento." }
          );
          return;
        }
        await handleRating(rate, ticket, ticketTraking);
        return;
      }
    }

    // Depois, verificar horário de atendimento
    if (!msg.key.fromMe) {
      const scheduleType = await Setting.findOne({
        where: {
          companyId,
          key: "scheduleType"
        }
      });

      // Verifica se o sistema de horário de expediente está desabilitado
      if (!scheduleType || scheduleType.value === "disabled") {
        return;
      } else {
        const currentSchedule = await VerifyCurrentSchedule(companyId);
        const { isOutOfHours, message } = await checkOutOfHours(ticket, scheduleType, currentSchedule);
        
        if (isOutOfHours && message) {
          // Atualiza o status do ticket para pending
          await ticket.update({
            status: "pending"
          });

          // Salva a mensagem do usuário
          if (hasMedia) {
            mediaSent = await verifyMediaMessage(msg, ticket, contact);
          } else {
            await verifyMessage(msg, ticket, contact);
          }

          // Envia a mensagem de fora do expediente
          await sendOutOfHoursMessage(wbot, ticket, message);
          return;
        }
      }
    }

    // Por último, processar a mensagem normalmente
    if (hasMedia) {
      mediaSent = await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    // Verificação de fila - apenas se não for uma avaliação
    if (!ticket.queue && !isGroup && !msg.key.fromMe && !ticket.userId) {
      // Verifica se o contato tem automação desabilitada
      if (contact.automation === false && contact.queueId) {
        // Atualiza o ticket com a fila do contato
        await UpdateTicketService({
          ticketData: { queueId: contact.queueId, status: "pending" },
          ticketId: ticket.id,
          companyId: ticket.companyId,
        });
        
        return;
      }
      
      // Primeiro verifica se é uma palavra-chave
      const isKeyword = await verifyKeyword(wbot, msg, ticket, contact, mediaSent);
      
      if (isKeyword) {
        return;
      }
      
      await verifyQueue(wbot, msg, ticket, contact, mediaSent);
      return;
    }

    //openai na conexao
    if (
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !isNil(whatsapp.promptId)
    ) {
      await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
    }

    //integraçao na conexao
    if (
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.queue &&
      !ticket.user &&
      ticket.chatbot &&
      !isNil(whatsapp.integrationId) &&
      !ticket.useIntegration
    ) {
      const integrations = await ShowQueueIntegrationService(whatsapp.integrationId, companyId);
      await handleMessageIntegration(msg, wbot, integrations, ticket);
      return;
    }

    //openai na fila
    if (
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !isNil(ticket.promptId) &&
      ticket.useIntegration &&
      ticket.queueId
    ) {
      await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
    }

    if (
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.userId &&
      ticket.integrationId &&
      ticket.useIntegration && 
      ticket.queue
    ) {
      const integrations = await ShowQueueIntegrationService(ticket.integrationId, companyId);
      await handleMessageIntegration(msg, wbot, integrations, ticket);
    }

    if (
      !ticket.queue &&
      !ticket.isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1 &&
      !ticket.useIntegration
    ) {
      const ticketTraking = await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: wbot.id!
      });

      await verifyQueue(wbot, msg, ticket, contact);
      if (ticketTraking.chatbotAt === null) {
        await ticketTraking.update({
          chatbotAt: moment().toDate(),
        });
      }
    }

    const dontReadTheFirstQuestion = ticket.queue === null;

    await ticket.reload();

    if (!whatsapp?.queues?.length && !ticket.userId && !isGroup && !msg.key.fromMe) {
      const lastMessage = await Message.findOne({
        where: {
          ticketId: ticket.id,
          fromMe: true
        },
        order: [["createdAt", "DESC"]]
      });

      if (lastMessage && lastMessage.body.includes(whatsapp.greetingMessage)) {
        return;
      }

      if (whatsapp.greetingMessage) {
        await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: whatsapp.greetingMessage
          }
        );
        return;
      }
    }

    if (whatsapp.queues.length == 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot);
      }
    }
    if (whatsapp.queues.length > 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot, dontReadTheFirstQuestion);
      }
    }

  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    Sentry.captureException(error);
  }
};

export const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise((r) => setTimeout(r, 500));
  const io = getIO();

  try {
    // Se o status for undefined, não atualiza
    if (chat === undefined) {
      logger.info(`[MessageAck] Status undefined para mensagem ${msg.key.id}, ignorando atualização`);
      return;
    }

    const messageToUpdate = await Message.findByPk(msg.key.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
        },
      ],
    });

    if (!messageToUpdate) {
      logger.info(`[MessageAck] Mensagem ${msg.key.id} não encontrada no banco`);
      return;
    }

    // Atualiza o status apenas se for diferente do atual
    if (messageToUpdate.ack !== chat) {
      await messageToUpdate.update({ ack: chat });
      
      io.to(messageToUpdate.ticketId.toString()).emit(
        `company-${messageToUpdate.companyId}-appMessage`,
        {
          action: "update",
          message: messageToUpdate,
        }
      );
    }
  } catch (err) {
    logger.error(`[MessageAck] Erro ao atualizar status da mensagem ${msg.key.id}: ${err}`);
    Sentry.captureException(err);
  }
};
