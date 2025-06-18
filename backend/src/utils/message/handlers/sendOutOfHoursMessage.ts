import { Session } from "../../../services/WbotServices/wbotMessageListener";
import Ticket from "../../../models/Ticket";
import * as Sentry from "@sentry/node";

const messageQueue = new Map();
const processingQueue = new Map();

export const sendOutOfHoursMessage = async (
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
        // Aguarda um pequeno intervalo entre as mensagens para evitar bloqueio
        await new Promise(resolve => setTimeout(resolve, 1000));
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