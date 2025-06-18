import moment from "moment";
import { logger } from "../../../utils/logger";
import Ticket from "../../../models/Ticket";
import Setting from "../../../models/Setting";
import Whatsapp from "../../../models/Whatsapp";
import Company from "../../../models/Company";
import Queue from "../../../models/Queue";
import { formatScheduleInfo, formatOutOfHoursMessage } from "../../schedule";
import VerifyCurrentSchedule from "../../../services/QueueService/VerifyCurrentSchedule";

export const checkOutOfHours = async (
  ticket: Ticket,
  scheduleType: Setting,
  currentSchedule: any
): Promise<{ isOutOfHours: boolean; message: string | null }> => {
  try {
    if (ticket.userId || !scheduleType || scheduleType.value === "disabled") {
      return { isOutOfHours: false, message: null };
    }

    if (scheduleType.value === "company" && currentSchedule?.currentSchedule) {
      const { startTime, endTime } = currentSchedule.currentSchedule;
      
      if (!currentSchedule.inActivity) {
        const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
        const company = await Company.findByPk(ticket.companyId);
        const message = whatsapp?.outOfHoursMessage || "Recebemos sua mensagem, mas no momento estamos fora do nosso horário de atendimento. Assim que estivermos online, responderemos você o mais breve possível.";
        
        return { 
          isOutOfHours: true, 
          message: formatOutOfHoursMessage(message, formatScheduleInfo(company.schedules || []))
        };
      }
    }

    if (scheduleType.value === "queue" && ticket.queueId) {
      const queue = await Queue.findByPk(ticket.queueId);
      if (!queue?.schedules?.length || !queue.outOfHoursMessage) {
        return { isOutOfHours: false, message: null };
      }

      const queueSchedule = await VerifyCurrentSchedule(queue.id);
      
      if (!queueSchedule.inActivity) {
        const message = formatOutOfHoursMessage(
          `*${queue.name}*\n\n${queue.outOfHoursMessage}`,
          formatScheduleInfo(queue.schedules)
        );
        return {
          isOutOfHours: true,
          message: `${message}\n\n*[ # ]* - Menu inicial`
        };
      }
    }

    return { isOutOfHours: false, message: null };
  } catch (error) {
    logger.error(error);
    return { isOutOfHours: false, message: null };
  }
};
