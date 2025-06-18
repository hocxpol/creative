import * as Sentry from "@sentry/node";
import { logger } from "../logger";
import {
  proto,
  WAMessage,
  WAMessageStubType,
  extractMessageContent,
  getContentType
} from "@whiskeysockets/baileys";
import { Buffer } from 'node:buffer';

/**
 * Obtém o tipo da mensagem
 */
export const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  return getContentType(msg.message);
};

/**
 * Obtém o corpo da mensagem
 */
export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    let type = getTypeMessage(msg);

    // Verifica se é uma mensagem editada
    if (msg.message?.protocolMessage?.type === 14) {
      const editedMessage = msg.message.protocolMessage.editedMessage;
      if (!editedMessage) return null;

      // Se a mensagem editada contém uma imagem, mantém o tipo imageMessage
      if (editedMessage.imageMessage) {
        type = 'imageMessage';
        return editedMessage.imageMessage.caption || '';
      }

      // Para outros tipos de mensagens editadas
      if (editedMessage?.conversation) return editedMessage.conversation;
      if (editedMessage?.extendedTextMessage?.text) return editedMessage.extendedTextMessage.text;
      if (editedMessage?.videoMessage?.caption) return editedMessage.videoMessage.caption;
      if (editedMessage?.documentMessage?.caption) return editedMessage.documentMessage.caption;
      if (editedMessage?.documentWithCaptionMessage?.message?.documentMessage?.caption) 
        return editedMessage.documentWithCaptionMessage.message.documentMessage.caption;
    }

    // Verifica se é uma mensagem editada via editedMessage
    if (msg.message?.editedMessage) {
      const editedContent = msg.message.editedMessage.message?.protocolMessage?.editedMessage;
      if (!editedContent) return null;

      // Se a mensagem editada contém uma imagem, mantém o tipo imageMessage
      if (editedContent.imageMessage) {
        type = 'imageMessage';
        return editedContent.imageMessage.caption || '';
      }

      // Para outros tipos de mensagens editadas
      if (editedContent?.conversation) return editedContent.conversation;
      if (editedContent?.extendedTextMessage?.text) return editedContent.extendedTextMessage.text;
      if (editedContent?.videoMessage?.caption) return editedContent.videoMessage.caption;
      if (editedContent?.documentMessage?.caption) return editedContent.documentMessage.caption;
      if (editedContent?.documentWithCaptionMessage?.message?.documentMessage?.caption) 
        return editedContent.documentWithCaptionMessage.message.documentMessage.caption;
    }

    const types = {
      conversation: msg?.message?.conversation,
      editedMessage: msg?.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation,
      imageMessage: msg.message?.imageMessage?.caption || 
                   msg.message?.editedMessage?.message?.imageMessage?.caption ||
                   msg.message?.protocolMessage?.editedMessage?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      audioMessage: "Áudio",
      documentMessage: msg.message?.documentMessage?.caption || msg.message?.documentMessage?.fileName,
      documentWithCaptionMessage: msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption || 
                               msg.message?.documentWithCaptionMessage?.message?.documentMessage?.fileName,
      extendedTextMessage: msg.message?.extendedTextMessage?.text,
      buttonsResponseMessage: msg.message?.buttonsResponseMessage?.selectedButtonId,
      templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo: msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.listResponseMessage?.title,
      buttonsMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      viewOnceMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage ? JSON.stringify(msg.message.contactMessage) : undefined,
      contactsArrayMessage: msg.message?.contactsArrayMessage ? JSON.stringify(msg.message.contactsArrayMessage) : undefined,
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
      listMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.title,
      listResponseMessage: msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      reactionMessage: msg.message?.reactionMessage?.text || "reaction",
    };

    const objKey = Object.keys(types).find(key => key === type);

    if (!objKey) {
      logger.warn(`#### Nao achou o type 152: ${type}
${JSON.stringify(msg)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }
    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
    return null;
  }
};

/**
 * Obtém o corpo da mensagem de botão
 */
export const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText}*`;

    for (const buton of msg.message?.viewOnceMessage?.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }

  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }

    return bodyMessage;
  }
};

/**
 * Obtém a mensagem citada
 */
export const getQuotedMessage = (msg: proto.IWebMessageInfo): any => {
  const body =
    msg.message.imageMessage.contextInfo ||
    msg.message.videoMessage.contextInfo ||
    msg.message?.documentMessage ||
    msg.message.extendedTextMessage.contextInfo ||
    msg.message.buttonsResponseMessage.contextInfo ||
    msg.message.listResponseMessage.contextInfo ||
    msg.message.templateButtonReplyMessage.contextInfo ||
    msg.message.buttonsResponseMessage?.contextInfo ||
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    msg.message.listResponseMessage?.contextInfo;
  msg.message.senderKeyDistributionMessage;

  return extractMessageContent(body[Object.keys(body).values().next().value]);
};

/**
 * Obtém o ID da mensagem citada
 */
export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  return body?.contextInfo?.stanzaId;
};

/**
 * Verifica se a mensagem é válida
 */
export const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "editedMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage";

    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }

    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};

/**
 * Verifica se o formato do vCard é válido
 */
const isValidVCardFormat = (vcard: string): boolean => {
  if (!vcard) return false;
  
  // Verifica se contém as tags básicas do vCard
  const hasBeginTag = vcard.includes('BEGIN:VCARD');
  const hasEndTag = vcard.includes('END:VCARD');
  const hasVersion = vcard.includes('VERSION:');
  
  return hasBeginTag && hasEndTag && hasVersion;
};

/**
 * Filtra mensagens válidas
 */
export const filterMessages = (msg: WAMessage): boolean => {
  try {
    // Log detalhado para debug
    logger.info(`[MessageFilter] Verificando mensagem: ${JSON.stringify({
      messageId: msg.key.id,
      type: msg.message ? Object.keys(msg.message)[0] : 'unknown',
      hasProtocolMessage: !!msg.message?.protocolMessage,
      hasEditedMessage: !!msg.message?.editedMessage,
      protocolMessageType: msg.message?.protocolMessage?.type,
      messageStubType: msg.messageStubType,
      editedMessageType: msg.message?.editedMessage ? Object.keys(msg.message.editedMessage)[0] : 'none',
      messageContextInfo: !!msg.message?.messageContextInfo
    })}`);

    // Verifica se é uma mensagem editada via editedMessage
    if (msg.message?.editedMessage) {
      const editedMessage = msg.message.editedMessage;
      const editedContent = editedMessage.message?.protocolMessage?.editedMessage || 
                          editedMessage.message; // Pode ser o conteúdo direto
      
      if (!editedContent) {
        logger.info(`[MessageFilter] Mensagem editada sem conteúdo válido filtrada: ${msg.key.id}`);
        return false;
      }

      // Verifica os diferentes tipos de conteúdo que podem ser editados
      const hasValidContent = 
        editedContent.conversation ||
        editedContent.extendedTextMessage?.text ||
        editedContent.imageMessage?.caption ||
        editedContent.videoMessage?.caption ||
        editedContent.documentMessage?.caption ||
        editedContent.documentWithCaptionMessage?.message?.documentMessage?.caption ||
        editedContent.audioMessage;

      if (!hasValidContent) {
        logger.info(`[MessageFilter] Mensagem editada sem conteúdo válido filtrada: ${msg.key.id}`);
        return false;
      }

      logger.info(`[MessageFilter] Mensagem editada detectada via editedMessage: ${msg.key.id}`);
      return true;
    }

    // Verifica se é uma mensagem editada via protocolMessage (REVOKE para mensagens editadas)
    if (msg.message?.protocolMessage?.type === 14) {
      const editedMessage = msg.message.protocolMessage.editedMessage;
      if (!editedMessage) {
        logger.info(`[MessageFilter] ProtocolMessage sem editedMessage filtrado: ${msg.key.id}`);
        return false;
      }

      // Verifica se a mensagem editada tem conteúdo válido
      const hasValidContent = 
        editedMessage.conversation ||
        editedMessage.extendedTextMessage?.text ||
        editedMessage.imageMessage?.caption ||
        editedMessage.videoMessage?.caption ||
        editedMessage.documentMessage?.caption ||
        editedMessage.documentWithCaptionMessage?.message?.documentMessage?.caption ||
        editedMessage.audioMessage;

      if (!hasValidContent) {
        logger.info(`[MessageFilter] Mensagem editada sem conteúdo válido filtrada: ${msg.key.id}`);
        return false;
      }

      logger.info(`[MessageFilter] Mensagem editada detectada via protocolMessage: ${msg.key.id}`);
      return true;
    }
    
    // Filtra outros protocolMessages
    if (msg.message?.protocolMessage) {
      // Permite apenas mensagens de revogação (type 0 - REVOKE)
      if (msg.message.protocolMessage.type === 0) {
        return true;
      }
      logger.info(`[MessageFilter] ProtocolMessage filtrado: ${msg.key.id}`);
      return false;
    }

    // Filtra mensagens de sistema
    if (
      [
        WAMessageStubType.E2E_DEVICE_CHANGED,
        WAMessageStubType.E2E_IDENTITY_CHANGED,
        WAMessageStubType.CIPHERTEXT
      ].includes(msg.messageStubType as number)
    ) {
      logger.info(`[MessageFilter] Mensagem de sistema filtrada: ${msg.key.id}`);
      return false;
    }

    // Verifica se é uma mensagem normal (não editada)
    const isNormalMessage = 
      msg.message?.conversation ||
      msg.message?.extendedTextMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
      msg.message?.audioMessage ||
      msg.message?.stickerMessage ||
      msg.message?.buttonsResponseMessage ||
      msg.message?.templateButtonReplyMessage ||
      msg.message?.listResponseMessage ||
      msg.message?.viewOnceMessage ||
      msg.message?.contactMessage ||  // Mensagem vCard simples
      msg.message?.contactsArrayMessage || // Múltiplos vCards
      msg.message?.messageContextInfo || // Suporte para messageContextInfo
      (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.contactMessage) || // vCard em mensagem citada
      (msg.message?.extendedTextMessage?.text && isValidVCardFormat(msg.message?.extendedTextMessage?.text)); // vCard em texto estendido

    if (!isNormalMessage) {
      logger.info(`[MessageFilter] Mensagem não normal filtrada: ${msg.key.id}`);
      logger.debug(`[MessageFilter] Detalhes da mensagem filtrada: ${JSON.stringify(msg.message)}`);
      return false;
    }

    // Validação específica para vCards
    if (msg.message?.contactMessage) {
      const vcard = msg.message.contactMessage.vcard;
      if (vcard && !isValidVCardFormat(vcard)) {
        logger.warn(`[MessageFilter] vCard inválido na mensagem: ${msg.key.id}`);
        return false;
      }
    }

    if (msg.message?.contactsArrayMessage) {
      const vcards = msg.message.contactsArrayMessage.contacts;
      if (!Array.isArray(vcards) || vcards.some(vcard => !isValidVCardFormat(vcard.vcard))) {
        logger.warn(`[MessageFilter] Array de vCards inválido na mensagem: ${msg.key.id}`);
        return false;
      }
    }

    logger.info(`[MessageFilter] Mensagem aceita: ${msg.key.id}`);
    return true;
  } catch (error) {
    logger.error(`[MessageFilter] Erro ao filtrar mensagem: ${error}`);
    Sentry.captureException(error);
    return false;
  }
};

// Função auxiliar para localização
export const msgLocation = (image, latitude, longitude) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");
    let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};
