import { proto } from "@whiskeysockets/baileys";
import { IMe, Session } from "../../../services/WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import { getIO } from "../../../libs/socket";
import { getBodyMessage, getTypeMessage, isValidMsg } from "../index";
import { logger } from "../../../utils/logger";
import * as Sentry from "@sentry/node";
import CreateMessageService from "../../../services/MessageServices/CreateMessageService";
import { getContactMessage, verifyContact } from "../../contact";
import ShowWhatsAppService from "../../../services/WhatsappService/ShowWhatsAppService";
import { cacheLayer } from "../../../libs/cache";
import FindOrCreateTicketService from "../../../services/TicketServices/FindOrCreateTicketService";
import { verifyQueue } from "../../queue";
import FindOrCreateATicketTrakingService from "../../../services/TicketServices/FindOrCreateATicketTrakingService";
import { verifyRating, handleRating } from "../../rating";
import { verifyMediaMessage } from "../../media";
import VerifyCurrentSchedule from "../../../services/CompanyService/VerifyCurrentSchedule";
import moment from "moment";
import { handleOpenAi } from "../../openai";
import ShowQueueIntegrationService from "../../../services/QueueIntegrationServices/ShowQueueIntegrationService";
import { handleMessageIntegration } from "../../integration";
import { handleChartbot } from "../../chatbot";
import { verifyKeyword } from "../../queue/keyword";

import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import Queue from "../../../models/Queue";
import Setting from "../../../models/Setting";
import User from "../../../models/User";
import Contact from "../../../models/Contact";
import Whatsapp from "../../../models/Whatsapp";
import UpdateTicketService from "../../../services/TicketServices/UpdateTicketService";

import { verifyQuotedMessage } from "./verifyQuotedMessage";
import { sendOutOfHoursMessage } from "./sendOutOfHoursMessage";
import { checkOutOfHours } from "./checkOutOfHours";
import { verifyMessage } from "./verifyMessage";

interface MessageData {
  id: string;
  ticketId: number;
  contactId?: number;
  body: string;
  fromMe: boolean;
  mediaType?: string;
  mediaUrl?: string;
  read: boolean;
  quotedMsgId?: string;
  ack?: number;
  remoteJid?: string;
  participant?: string;
  dataJson: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  isForwarded?: boolean;
}

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
    // Trata mensagens de revogação
    if (msg.message?.protocolMessage?.type === 0) { // Tipo 0 é REVOKE (apagar mensagem)
      const messageId = msg.message.protocolMessage.key?.id;
      if (messageId) {
      const message = await Message.findOne({
          where: { id: messageId },
          include: [
            {
              model: Ticket,
              as: "ticket",
              include: [
                "contact",
                "queue",
                { model: User, as: "user" },
                { model: Whatsapp, as: "whatsapp" }
              ]
            }
          ]
      });

      if (message) {
          // Atualiza o status da mensagem
        await message.update({ isDeleted: true });
          // Se for a última mensagem do ticket, atualiza o lastMessage
          if (message.ticket && message.ticket.lastMessage === message.body) {
            await message.ticket.update({ 
              lastMessage: "Essa mensagem foi apagada pelo contato." 
            });
          }
        
          // Notifica a interface
        const io = getIO();
        io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
          action: "update",
            message,
            ticket: message.ticket,
            contact: message.ticket.contact
        });
          logger.info(`[MessageRevoke] Mensagem ${messageId} marcada como apagada`);
        } else {
          logger.warn(`[MessageRevoke] Mensagem ${messageId} não encontrada no banco`);
        }
      }
      return;
    }

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
          isDeleted: false,
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

      // Só verifica o horário se o scheduleType não estiver desabilitado
      if (scheduleType && scheduleType.value !== "disabled") {
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
