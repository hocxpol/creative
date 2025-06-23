import { proto } from "@whiskeysockets/baileys";
import { Session } from "../../services/WbotServices/wbotMessageListener";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact"; // Adicione esta linha
import QueueIntegrations from "../../models/QueueIntegrations";
import { getBodyMessage, getTypeMessage } from "../message";
import { logger } from "../logger";
import { isNil } from "lodash";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import axios from "axios";
import { delay } from "@whiskeysockets/baileys";
import typebotListener from "../../services/TypebotServices/typebotListener";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";


const request = require("request");

export const handleMessageIntegration = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  queueIntegration: QueueIntegrations,
  ticket: Ticket
): Promise<void> => {
  const msgType = getTypeMessage(msg);

  if (queueIntegration.type === "n8n" || queueIntegration.type === "webhook") {
    if (queueIntegration?.urlN8N) {
      const options = {
        method: "POST",
        url: queueIntegration?.urlN8N,
        headers: {
          "Content-Type": "application/json"
        },
        json: msg
      };
      try {
        request(options, function (error, response) {
          if (error) {
            throw new Error(error);
          }
        });
      } catch (error) {
        throw new Error(error);
      }
    }
  } else if (queueIntegration.type === "typebot") {
    await typebotListener({ ticket, msg, wbot, typebot: queueIntegration });
  }
};

const transferQueue = async (
  queueId: number,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  // Buscar a fila para obter o whatsappId associado
  const queue = await Queue.findByPk(queueId, {
    include: [
      {
        model: Whatsapp,
        as: "whatsapps",
        required: true
      }
    ]
  });

  if (!queue || !queue.whatsapps || queue.whatsapps.length === 0) {
    throw new Error("Queue or WhatsApp connection not found");
  }

  // Pega o primeiro WhatsApp associado à fila
  const whatsapp = queue.whatsapps[0];

  await UpdateTicketService({
    ticketData: { 
      queueId: queueId, 
      useIntegration: false, 
      promptId: null,
      whatsappId: whatsapp.id
    },
    ticketId: ticket.id,
    companyId: ticket.companyId
  });
};
export { transferQueue };
