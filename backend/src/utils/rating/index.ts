import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import ShowWhatsAppService from "../../services/WhatsappService/ShowWhatsAppService";
import SendWhatsAppMessage from "../../services/WbotServices/SendWhatsAppMessage";
import moment from "moment";
import formatBody from "../../helpers/Mustache";
import * as Sentry from "@sentry/node";

/**
 * Verifica se um ticket está elegível para avaliação
 * @param ticketTraking - O objeto de tracking do ticket
 * @returns boolean indicando se o ticket pode ser avaliado
 */
export const verifyRating = (ticketTraking: TicketTraking): boolean => {
  try {
    if (
      ticketTraking &&
      ticketTraking.ratingAt !== null &&
      ticketTraking.rated === false
    ) {
      return true;
    }
    return false;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

/**
 * Processa a avaliação do atendimento
 * @param rate - A nota da avaliação (1-3)
 * @param ticket - O ticket sendo avaliado
 * @param ticketTraking - O objeto de tracking do ticket
 */
export const handleRating = async (
  rate: number,
  ticket: Ticket,
  ticketTraking: TicketTraking
): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();

    const io = getIO();

    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );

    // Garante que a nota esteja entre 1 e 3
    let finalRate = rate;
    if (rate < 1) finalRate = 1;
    if (rate > 3) finalRate = 3;

    // Cria o registro de avaliação
    await UserRating.create({
      ticketId: ticketTraking.ticketId,
      companyId: ticketTraking.companyId,
      userId: ticketTraking.userId,
      rate: finalRate,
    });

    // Envia mensagem de conclusão se existir
    if (complationMessage) {
      const body = formatBody(`\u200e${complationMessage}`, ticket.contact);
      await SendWhatsAppMessage({ body, ticket });
    }

    // Atualiza o tracking do ticket
    await ticketTraking.update({
      finishedAt: moment().toDate(),
      rated: true,
    });

    // Atualiza o ticket
    await ticket.update({
      queueId: null,
      chatbot: null,
      queueOptionId: null,
      userId: null,
      status: "closed",
    });

    // Notifica os clientes conectados sobre as mudanças
    io.to(`company-${ticket.companyId}-open`)
      .to(`queue-${ticket.queueId}-open`)
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id,
      });

    io.to(`company-${ticket.companyId}-${ticket.status}`)
      .to(`queue-${ticket.queueId}-${ticket.status}`)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id,
      });
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};