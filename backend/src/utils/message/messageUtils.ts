import { proto } from "@whiskeysockets/baileys";

export const getBodyMessage = (msg: proto.IWebMessageInfo): string => {
  if (msg.message?.conversation) {
    return msg.message.conversation;
  }
  if (msg.message?.extendedTextMessage?.text) {
    return msg.message.extendedTextMessage.text;
  }
  if (msg.message?.imageMessage?.caption) {
    return msg.message.imageMessage.caption;
  }
  if (msg.message?.videoMessage?.caption) {
    return msg.message.videoMessage.caption;
  }
  if (msg.message?.documentMessage?.caption) {
    return msg.message.documentMessage.caption;
  }
  if (msg.message?.documentWithCaptionMessage?.message?.documentMessage?.caption) {
    return msg.message.documentWithCaptionMessage.message.documentMessage.caption;
  }
  if (msg.message?.buttonsResponseMessage?.selectedDisplayText) {
    return msg.message.buttonsResponseMessage.selectedDisplayText;
  }
  if (msg.message?.listResponseMessage?.title) {
    return msg.message.listResponseMessage.title;
  }
  if (msg.message?.locationMessage) {
    return "Location";
  }
  if (msg.message?.contactMessage) {
    return "Contact";
  }
  if (msg.message?.contactsArrayMessage) {
    return "Contacts";
  }
  if (msg.message?.reactionMessage) {
    return "Reaction";
  }
  if (msg.message?.stickerMessage) {
    return "Sticker";
  }
  if (msg.message?.audioMessage) {
    return "Audio";
  }
  if (msg.message?.documentMessage) {
    return "Document";
  }
  if (msg.message?.imageMessage) {
    return "Image";
  }
  if (msg.message?.videoMessage) {
    return "Video";
  }
  return "";
};

export const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  if (msg.message?.conversation) {
    return "conversation";
  }
  if (msg.message?.extendedTextMessage) {
    return "extendedTextMessage";
  }
  if (msg.message?.imageMessage) {
    return "imageMessage";
  }
  if (msg.message?.videoMessage) {
    return "videoMessage";
  }
  if (msg.message?.documentMessage) {
    return "documentMessage";
  }
  if (msg.message?.documentWithCaptionMessage) {
    return "documentWithCaptionMessage";
  }
  if (msg.message?.buttonsResponseMessage) {
    return "buttonsResponseMessage";
  }
  if (msg.message?.listResponseMessage) {
    return "listResponseMessage";
  }
  if (msg.message?.locationMessage) {
    return "locationMessage";
  }
  if (msg.message?.contactMessage) {
    return "contactMessage";
  }
  if (msg.message?.contactsArrayMessage) {
    return "contactsArrayMessage";
  }
  if (msg.message?.reactionMessage) {
    return "reactionMessage";
  }
  if (msg.message?.stickerMessage) {
    return "stickerMessage";
  }
  if (msg.message?.audioMessage) {
    return "audioMessage";
  }
  return "";
};

export const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  const msgType = getTypeMessage(msg);
  const validTypes = [
    "conversation",
    "extendedTextMessage",
    "imageMessage",
    "videoMessage",
    "documentMessage",
    "documentWithCaptionMessage",
    "buttonsResponseMessage",
    "listResponseMessage",
    "locationMessage",
    "contactMessage",
    "contactsArrayMessage",
    "reactionMessage",
    "stickerMessage",
    "audioMessage"
  ];
  return validTypes.includes(msgType);
}; 