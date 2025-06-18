import { proto } from "@whiskeysockets/baileys";
import { getIO } from "../../../libs/socket";
import { logger } from "../../../utils/logger";
import * as Sentry from "@sentry/node";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import Contact from "../../../models/Contact";
import Queue from "../../../models/Queue";
import User from "../../../models/User";
import Whatsapp from "../../../models/Whatsapp";
import { getBodyMessage, getTypeMessage } from "../messageUtils";
import CreateMessageService from "../../../services/MessageServices/CreateMessageService";
import { verifyQuotedMessage } from "./verifyQuotedMessage";
import { Model } from "sequelize-typescript";

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

  const messageData: MessageData = {
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
    isDeleted: false,
    isForwarded
  };

  try {
    // Atualiza o ticket com a última mensagem
    await ticket.update({
      lastMessage: messageData.isDeleted ? "Essa mensagem foi apagada pelo contato." :
                  messageData.isEdited ? `${body} (Mensagem editada)` : 
                  body
    });

    // Cria ou atualiza a mensagem no banco
    const message = await CreateMessageService({ messageData, companyId: ticket.companyId });
    logger.info(`Message processed successfully: ${message.id}`);

    // Emite evento de atualização do ticket para todos os canais
    io.to(`company-${ticket.companyId}-${ticket.status}`)
      .to(`company-${ticket.companyId}-notification`)
      .to(`queue-${ticket.queueId}-${ticket.status}`)
      .to(`queue-${ticket.queueId}-notification`)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket: await ticket.reload({
          include: [
            { model: Queue, as: "queue" },
            { model: User, as: "user" },
            { model: Contact, as: "contact" },
            { model: Whatsapp, as: "whatsapp" }
          ]
        })
      });

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