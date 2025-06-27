import { WAMessage, AnyMessageContent, WAMediaUpload } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  isForwarded?: boolean;
  originalMessage?: Message;
}

const MediaTypes = {
  image: "image",
  video: "video",
  audio: "audio",
  document: "document"
} as const;

type MediaType = keyof typeof MediaTypes;

const getDefaultMimetype = (mediaType: MediaType): string => {
  switch (mediaType) {
    case MediaTypes.image: return "image/jpeg";
    case MediaTypes.video: return "video/mp4";
    case MediaTypes.audio: return "audio/ogg";
    default: return "application/octet-stream";
  }
};

const createMediaMessage = (
  mediaType: MediaType,
  url: string,
  caption: string,
  mimetype?: string
): AnyMessageContent => {
  const baseConfig = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1
    }
  };

  const resolvedMimetype = mimetype || getDefaultMimetype(mediaType);

  switch (mediaType) {
    case MediaTypes.image:
      return {
        image: { url } as WAMediaUpload,
        caption,
        mimetype: resolvedMimetype,
        ...baseConfig
      };
    case MediaTypes.video:
      return {
        video: { url } as WAMediaUpload,
        caption,
        mimetype: resolvedMimetype,
        ...baseConfig
      };
    case MediaTypes.audio:
      return {
        audio: { url } as WAMediaUpload,
        mimetype: resolvedMimetype,
        ...baseConfig
      };
    default:
      return {
        document: { url } as WAMediaUpload,
        caption,
        mimetype: resolvedMimetype,
        ...baseConfig
      };
  }
};

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  isForwarded,
  originalMessage
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);

  if (!wbot) {
    throw new AppError("WhatsApp não está conectado. Verifique a página de conexões.");
  }

  // Tratamento para mensagens citadas (quotedMsg)
  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: { id: quotedMsg.id }
    });

    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);
      options = {
        quoted: {
          key: {
            remoteJid: msgFound.key.remoteJid,
            id: msgFound.key.id,
            fromMe: msgFound.key.fromMe,
            participant: msgFound.key.participant
          },
          message: msgFound.message
        }
      };
    }
  }

  // Validação e limpeza do número
  const cleanNumber = ticket.contact.number.replace(/[^0-9]/g, "");
  const number = `${cleanNumber}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  try {
    let sentMessage: WAMessage;
    if (isForwarded && originalMessage) {
      const originalMsgData = JSON.parse(originalMessage.dataJson);

      if (!originalMsgData.key?.id || !originalMsgData.message) {
        throw new AppError("Estrutura da mensagem original inválida");
      }

      // Se for uma mensagem com mídia, preserva a mídia durante o encaminhamento
      if (originalMessage.mediaUrl && originalMessage.mediaType) {
        const validMediaTypes: MediaType[] = Object.values(MediaTypes);
        const mediaType = validMediaTypes.includes(originalMessage.mediaType as MediaType)
          ? (originalMessage.mediaType as MediaType)
          : MediaTypes.document;

        const mediaMessage = createMediaMessage(
          mediaType,
          originalMessage.mediaUrl,
          formatBody(body, ticket.contact)
        );

        sentMessage = await wbot.sendMessage(number, mediaMessage, { ...options });
      } else if (originalMessage.isEdited) {
        // Se for uma mensagem editada sem mídia
        sentMessage = await wbot.sendMessage(
          number,
          {
            text: formatBody(body, ticket.contact),
            contextInfo: {
              isForwarded: true,
              forwardingScore: 1
            }
          } as AnyMessageContent,
          { ...options }
        );
      } else {
        // Para outros tipos de mensagens
        const messageToForward = {
          key: {
            id: originalMsgData.key.id,
            fromMe: originalMsgData.key.fromMe || false,
            remoteJid: originalMsgData.key.remoteJid,
            participant: originalMsgData.key.participant || undefined
          },
          message: originalMsgData.message,
          messageTimestamp: originalMsgData.messageTimestamp || Math.floor(Date.now() / 1000),
          status: originalMsgData.status || "SENT"
        };

        sentMessage = await wbot.sendMessage(
          number,
          {
            forward: messageToForward,
            contextInfo: {
              isForwarded: true,
              forwardingScore: 1
            }
          } as AnyMessageContent,
          { ...options }
        );
      }
    } else {
      // Mensagem normal (não encaminhada)
      sentMessage = await wbot.sendMessage(
        number,
        { text: formatBody(body, ticket.contact) } as AnyMessageContent,
        { ...options }
      );
    }

    // Atualiza o ticket com a última mensagem
    const lastMessage = isForwarded
      ? originalMessage.mediaType
        ? `Mídia (${originalMessage.mediaType}) encaminhada`
        : "Mensagem encaminhada"
      : formatBody(body, ticket.contact);

    await ticket.update({ 
      lastMessage,
      fromMe: true
    });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);

    if (err.message.includes("not-authorized")) {
      throw new AppError("WhatsApp não está conectado. Verifique a página de conexões.");
    }

    throw new AppError(`Erro ao enviar mensagem: ${err.message}`);
  }
};

export default SendWhatsAppMessage;
