import * as Sentry from "@sentry/node";
import { logger } from "../logger";
import {
  proto,
  WASocket,
  jidNormalizedUser
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../../services/ContactServices/CreateOrUpdateContactService";
import { Store } from "../../libs/store";
import { IMe, Session } from "../../services/WbotServices/wbotMessageListener";

/**
 * Obtém informações do socket atual
 */
export const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  };
};

/**
 * Obtém o ID do remetente da mensagem
 */
export const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

/**
 * Obtém informações do contato da mensagem
 */
export const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? {
      id: getSenderMessage(msg, wbot),
      name: msg.pushName
    }
    : {
      id: msg.key.remoteJid,
      name: msg.key.fromMe ? rawNumber : msg.pushName
    };
};

/**
 * Verifica e atualiza informações do contato
 */
export const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  } catch (e) {
    Sentry.captureException(e);
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  const contact = await Contact.findOne({ where: { number: msgContact.id.replace(/\D/g, "") } });

  const contactData = {
    name: msgContact?.name || (contact ? contact.name : `Contato ${msgContact.id.replace(/\D/g, "")}`),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    whatsappId: wbot.id
  };

  const contactResult = CreateOrUpdateContactService(contactData);

  return contactResult;
};