import {
  WASocket,
  BinaryNode,
  Contact as BContact,
} from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";

import { Op } from "sequelize";
// import { getIO } from "../../libs/socket";
import { Store } from "../../libs/store";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import moment from "moment";
import Queue from "../../models/Queue";
import { checkOutOfHours } from "../../utils/message/handlers";
import VerifyCurrentSchedule from "../../services/CompanyService/VerifyCurrentSchedule";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;

      if (content.tag === "offer") {
        const { from, id } = node.attrs;

      }

      if (content.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "call", companyId },
        });

        if (sendMsgCall.value === "disabled") {
          const whatsapp = await Whatsapp.findOne({
            where: { id: wbot.id }
          });

          const number = node.attrs.from.replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { companyId, number },
          });

          if (!contact) return;

          const ticket = await Ticket.findOne({
            where: {
              contactId: contact.id,
              whatsappId: wbot.id,
              companyId
            },
          });

          // Primeiro envia a mensagem de chamadas desabilitadas
          const callMessage = whatsapp?.callMessage || "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado";
          await wbot.sendMessage(node.attrs.from, {
            text: callMessage
          });

          // Verifica horário de expediente
          const scheduleType = await Setting.findOne({
            where: {
              companyId,
              key: "scheduleType"
            }
          });

          // Se estiver fora do expediente, envia a mensagem de fora do expediente
          if (scheduleType) {
            const currentSchedule = await VerifyCurrentSchedule(companyId);
            const { isOutOfHours, message: outOfHoursMessage } = await checkOutOfHours(ticket, scheduleType, currentSchedule);

            if (isOutOfHours && outOfHoursMessage) {
              await wbot.sendMessage(node.attrs.from, {
                text: outOfHoursMessage
              });
            }
          }

          // se não existir o ticket não faz nada.
          if (!ticket) return;

          const date = new Date();
          const hours = date.getHours();
          const minutes = date.getMinutes();

          const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;
          const messageData = {
            id: content.attrs["call-id"],
            ticketId: ticket.id,
            contactId: contact.id,
            body,
            fromMe: false,
            mediaType: "call_log",
            read: true,
            quotedMsgId: null,
            ack: 1,
          };

          await ticket.update({
            lastMessage: body,
          });

          if(ticket.status === "closed") {
            await ticket.update({
              status: "pending",
            });
          }

          return CreateMessageService({ messageData, companyId: companyId });
        }
      }
    });

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {

      await createOrUpdateBaileysService({
        whatsappId: whatsapp.id,
        contacts,
      });
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
