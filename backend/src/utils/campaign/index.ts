import { proto } from "@whiskeysockets/baileys";
import { Op } from "sequelize";
import moment from "moment";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import * as Sentry from "@sentry/node";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import { getBodyMessage } from "../message";

export const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  try {
    if (!message.key.fromMe) {
      const number = message.key.remoteJid.replace(/\D/g, "");
      const campaigns = await Campaign.findAll({
        where: { companyId, status: "EM_ANDAMENTO", confirmation: true },
      });

      if (campaigns.length) {
        const ids = campaigns.map((c) => c.id);
        const campaignShipping = await CampaignShipping.findOne({
          where: { campaignId: { [Op.in]: ids }, number, confirmation: null },
        });

        if (campaignShipping) {
          await campaignShipping.update({
            confirmedAt: moment(),
            confirmation: true,
          });
          await campaignQueue.add(
            "DispatchCampaign",
            {
              campaignShippingId: campaignShipping.id,
              campaignId: campaignShipping.campaignId,
            },
            {
              delay: parseToMilliseconds(randomValue(0, 10)),
            }
          );
          logger.info(`[Campaign] Campanha confirmada para número ${number}, campaignShippingId: ${campaignShipping.id}`);
        }
      }
    }
  } catch (err) {
    logger.error(`[Campaign] Erro ao verificar campanha recente: ${err}`);
    Sentry.captureException(err);
  }
};

export const verifyCampaignMessageAndCloseTicket = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  try {
    const io = getIO();
    const body = getBodyMessage(message);
    const isCampaign = /\u200c/.test(body);

    if (message.key.fromMe && isCampaign) {
      const messageRecord = await Message.findOne({
        where: { id: message.key.id!, companyId },
      });

      if (!messageRecord) {
        logger.info(`[CampaignTicket] Mensagem ${message.key.id} não encontrada`);
        return;
      }

      const ticket = await Ticket.findByPk(messageRecord.ticketId);

      if (!ticket) {
        logger.info(`[CampaignTicket] Ticket ${messageRecord.ticketId} não encontrado`);
        return;
      }

      await ticket.update({ status: "closed" });
      logger.info(`[CampaignTicket] Ticket ${ticket.id} fechado por mensagem de campanha`);

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
    }
  } catch (err) {
    logger.error(`[CampaignTicket] Erro ao verificar/fechar ticket de campanha: ${err}`);
    Sentry.captureException(err);
  }
};