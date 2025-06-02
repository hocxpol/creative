import { IMe, Session } from "../../services/WbotServices/wbotMessageListener";
import { proto } from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { verifyMessage } from "../message/handlers";
import formatBody from "../../helpers/Mustache";
import fs from 'fs';

export const sendMessageImage = async (
    wbot: Session,
    contact: Contact,
    ticket: Ticket,
    url: string,
    caption: string
  ) => {
    let sentMessage;
    try {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          image: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
          fileName: caption,
          caption: caption,
          mimetype: 'image/jpeg'
        }
      );
    } catch (error) {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: formatBody('Não consegui enviar o PDF, tente novamente!', contact)
        }
      );
    }
    verifyMessage(sentMessage, ticket, contact);
  };
  
  export const sendMessageLink = async (
    wbot: Session,
    contact: Contact,
    ticket: Ticket,
    url: string,
    caption: string
  ) => {
    let sentMessage;
    try {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          document: url ? { url } : fs.readFileSync(`public/temp/${caption}-${makeid(10)}`),
          fileName: caption,
          caption: caption,
          mimetype: 'application/pdf'
        }
      );
    } catch (error) {
      sentMessage = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        {
          text: formatBody('Não consegui enviar o PDF, tente novamente!', contact)
        }
      );
    }
    verifyMessage(sentMessage, ticket, contact);
  };
  
  export function makeid(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }