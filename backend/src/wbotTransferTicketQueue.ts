import { Op } from "sequelize";
import TicketTraking from "./models/TicketTraking";
import { format } from "date-fns";
import moment from "moment";
import Ticket from "./models/Ticket";
import Whatsapp from "./models/Whatsapp";
import { getIO } from "./libs/socket";
import { logger } from "./utils/logger";
import ShowTicketService from "./services/TicketServices/ShowTicketService";

export const TransferTicketQueue = async (): Promise<void> => {
  const io = getIO();

  try {
    //buscar os tickets que estão pendentes e sem fila
    const tickets = await Ticket.findAll({
      where: {
        status: "pending",
        queueId: {
          [Op.is]: null
        },
      },
    });

    // varrer os tickets e verificar se algum deles está com o tempo estourado
    for (const ticket of tickets) {
      const wpp = await Whatsapp.findOne({
        where: {
          id: ticket.whatsappId
        }
      });

      if (!wpp || !wpp.timeToTransfer || !wpp.transferQueueId || wpp.timeToTransfer == 0) continue;

      let dataLimite = new Date(ticket.updatedAt);
      dataLimite.setMinutes(dataLimite.getMinutes() + wpp.timeToTransfer);

      if (new Date() > dataLimite) {
        await ticket.update({
          queueId: wpp.transferQueueId,
        });

        const ticketTraking = await TicketTraking.findOne({
          where: {
            ticketId: ticket.id
          },
          order: [["createdAt", "DESC"]]
        });

        if (ticketTraking) {
          await ticketTraking.update({
            queuedAt: moment().toDate(),
            queueId: wpp.transferQueueId,
          });
        }

        const currentTicket = await ShowTicketService(ticket.id, ticket.companyId);

        // Notifica todas as partes do frontend que precisam ser atualizadas
        const ticketData = {
          action: "update",
          ticket: currentTicket,
          traking: "created ticket"
        };

        // Notifica o canal principal da empresa
        io.to(`company-${ticket.companyId}-mainchannel`)
          .emit(`company-${ticket.companyId}-ticket`, ticketData);

        // Notifica o canal do ticket específico
        io.to(ticket.id.toString())
          .emit(`company-${ticket.companyId}-ticket`, ticketData);

        // Notifica o canal de notificações
        io.to("notification")
          .emit(`company-${ticket.companyId}-ticket`, ticketData);

        // Notifica o canal do status atual
        io.to(ticket.status)
          .emit(`company-${ticket.companyId}-ticket`, ticketData);

        // Notifica o canal da nova fila
        io.to(`queue-${wpp.transferQueueId}-${ticket.status}`)
          .emit(`company-${ticket.companyId}-ticket`, ticketData);

        // Notifica o canal da fila antiga (null) para remover o ticket
        io.to(`queue-null-${ticket.status}`)
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "delete",
            ticketId: ticket.id
          });

        // Notifica o canal de todas as filas
        io.to(`queue-${ticket.status}`)
          .emit(`company-${ticket.companyId}-ticket`, ticketData);

        logger.info(`Transferencia de ticket automatica ticket id ${ticket.id} para a fila ${wpp.transferQueueId}`);
      }
    }
  } catch (error) {
    logger.error(`Erro ao transferir tickets automaticamente: ${error}`);
  }
};
