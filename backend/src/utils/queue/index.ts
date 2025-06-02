import { IMe, Session } from "../../services/WbotServices/wbotMessageListener";
import { proto } from "@whiskeysockets/baileys";
import { isNil, head } from "lodash";
import moment from "moment";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import { getBodyMessage } from "../message";
import { verifyMessage } from "../message/handlers";
import { debounce } from "../../helpers/Debounce";
import ShowWhatsAppService from "../../services/WhatsappService/ShowWhatsAppService";
import ShowQueueIntegrationService from "../../services/QueueIntegrationServices/ShowQueueIntegrationService";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../../services/TicketServices/FindOrCreateATicketTrakingService";
import { handleMessageIntegration } from "../integration";
import { handleOpenAi } from "../openai";
import * as Sentry from "@sentry/node";
import QueueOption from "../../models/QueueOption";
import { Sequelize } from "sequelize";
import { formatScheduleInfo, formatOutOfHoursMessage } from "../schedule";

export const verifyQueue = async (
    wbot: Session,
    msg: proto.IWebMessageInfo,
    ticket: Ticket,
    contact: Contact,
    mediaSent?: Message | undefined
  ) => {
    try {
      const timestamp = new Date().toISOString();

      const companyId = ticket.companyId;
  
      // Verifica se o ticket já está em uma fila e não está pendente
      if (ticket.queueId && ticket.status !== "pending") {
        return;
      }
  
      const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(
        wbot.id!,
        ticket.companyId
      );
  
      // Filtra as filas invisíveis
      const visibleQueues = queues.filter(queue => !queue.isInvisible);
  
      // Verifica se o ticket já está em uma fila válida
      if (ticket.queueId && visibleQueues.some(q => q.id === ticket.queueId)) {
        return;
      }

      // Verifica o horário antes de processar a seleção da fila
      const scheduleType = await Setting.findOne({
        where: {
          companyId,
          key: "scheduleType"
        }
      });

      // Só verifica o horário se o scheduleType não estiver desabilitado
      if (scheduleType && scheduleType.value !== "disabled") {
        const selectedOption = getBodyMessage(msg);
        const choosenQueue = visibleQueues[+selectedOption - 1];

        if (choosenQueue) {
          // Se o tipo de horário for "queue", verifica o horário da fila
          if (scheduleType.value === "queue") {
            const queue = await Queue.findByPk(choosenQueue.id);
            const { schedules }: any = queue;
            const now = moment();
            const weekday = now.format("dddd").toLowerCase();
            let schedule;
            
            if (Array.isArray(schedules) && schedules.length > 0) {
              schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
            }

            if (queue.outOfHoursMessage !== null && queue.outOfHoursMessage !== "" && !isNil(schedule)) {
              const startTime = moment(schedule.startTime, "HH:mm");
              const endTime = moment(schedule.endTime, "HH:mm");

              if (now.isBefore(startTime) || now.isAfter(endTime)) {
                const scheduleInfo = formatScheduleInfo(schedules);
                const body = formatBody(
                  `*${queue.name}*\n\n${queue.outOfHoursMessage}\n\n*Horários de Funcionamento:*\n${scheduleInfo}\n\n*[ # ]* - Menu inicial`,
                  ticket.contact
                );
                const sentMessage = await wbot.sendMessage(
                  `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                  { text: body }
                );
                await verifyMessage(sentMessage, ticket, contact);
                return;
              }
            }
          }
          // Se o tipo de horário for "company", não verifica o horário da fila
          // A verificação do horário da empresa já foi feita anteriormente
        }
      }
  
      // Se não houver filas visíveis, não envie nada
      if (visibleQueues.length === 0) {
        // Se não há saudação, não envie nada
        if (!greetingMessage || greetingMessage.trim().length === 0) {
          return;
        }
        // Se houver saudação, envie apenas a saudação
        const body = formatBody(`${greetingMessage}`, contact);
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        return;
      }
  
      if (visibleQueues.length === 1) {
        const sendGreetingMessageOneQueues = await Setting.findOne({
          where: {
            key: "sendGreetingMessageOneQueues",
            companyId: ticket.companyId
          }
        });
  
        if (greetingMessage.length > 1 && sendGreetingMessageOneQueues?.value === "enabled") {
          const body = formatBody(`${greetingMessage}`, contact);
  
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: body }
          );
        }
  
        const firstQueue = head(visibleQueues);
        let chatbot = false;
        if (firstQueue?.options) {
          chatbot = firstQueue.options.length > 0;
        }
  
        //inicia integração dialogflow/n8n
        if (
          !msg.key.fromMe &&
          !ticket.isGroup &&
          !isNil(visibleQueues[0]?.integrationId)
        ) {
          const integrations = await ShowQueueIntegrationService(visibleQueues[0].integrationId, companyId);
  
          await handleMessageIntegration(msg, wbot, integrations, ticket);
  
          await ticket.update({
            useIntegration: true,
            integrationId: integrations.id
          });
        }

        //inicia integração openai
        if (
          !msg.key.fromMe &&
          !ticket.isGroup &&
          !isNil(visibleQueues[0]?.promptId)
        ) {
          await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
  
          await ticket.update({
            useIntegration: true,
            promptId: visibleQueues[0]?.promptId
          });
        }
  
        await UpdateTicketService({
          ticketData: { queueId: firstQueue.id, chatbot, status: "pending" },
          ticketId: ticket.id,
          companyId: ticket.companyId,
        });
  
        return;
      }
  
      const selectedOption = getBodyMessage(msg);
      const choosenQueue = visibleQueues[+selectedOption - 1];
  
      const buttonActive = await Setting.findOne({
        where: {
          key: "chatBotType",
          companyId
        }
      });
  
      const botText = async () => {
        let options = "";
    
        visibleQueues.forEach((queue, index) => {
          options += `*[ ${index + 1} ]* - ${queue.name}\n`;
        });
  
        options += `\n*[ # ]* - Menu inicial`;
  
        const textMessage = {
          text: formatBody(`\u200e${greetingMessage}\n\n${options}`, contact),
        };
  
        const debouncedSentMessage = debounce(
          async () => {
            const sendMsg = await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              textMessage
            );
  
            await verifyMessage(sendMsg, ticket, ticket.contact);
          },
          1500,
          ticket.id
        );
        debouncedSentMessage();
      };
  
      if (choosenQueue) {
        let chatbot = false;
        if (choosenQueue?.options) {
          chatbot = choosenQueue.options.length > 0;
        }
    
        await UpdateTicketService({
          ticketData: { queueId: choosenQueue.id, chatbot },
          ticketId: ticket.id,
          companyId: ticket.companyId,
        });

        //inicia integração dialogflow/n8n
        if (
          !msg.key.fromMe &&
          !ticket.isGroup &&
          choosenQueue.integrationId
        ) {
          const integrations = await ShowQueueIntegrationService(choosenQueue.integrationId, companyId);
    
          await handleMessageIntegration(msg, wbot, integrations, ticket);
    
          await ticket.update({
            useIntegration: true,
            integrationId: integrations.id
          });
        }
    
        //inicia integração openai
        if (
          !msg.key.fromMe &&
          !ticket.isGroup &&
          !isNil(choosenQueue?.promptId)
        ) {
          await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
    
          await ticket.update({
            useIntegration: true,
            promptId: choosenQueue?.promptId
          });
        }

        // Buscar as opções da fila
        const queueOptions = await QueueOption.findAll({
          where: { queueId: choosenQueue.id, parentId: null },
              order: [
                [Sequelize.cast(Sequelize.col('option'), 'INTEGER'), 'ASC'],
                ["createdAt", "ASC"],
              ],

        });

        // Preparar a mensagem combinada
        let options = "";
        queueOptions.forEach((option) => {
          options += `*[ ${option.option} ]* - ${option.title}\n`;
        });
        options += `\n*[ 0 ]* - Menu anterior`;
        options += `\n*[ # ]* - Menu inicial`;

        const textMessage = {
          text: formatBody(`\u200e*${choosenQueue.name}*\n\n${choosenQueue.greetingMessage}\n\n${options}`, ticket.contact),
        };

        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          textMessage
        );

        await verifyMessage(sendMsg, ticket, contact);
      } else {
        if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
        // await UpdateTicketService({
        //   ticketData: { queueId: queues[0].id },
        //   ticketId: ticket.id
        // });
          return;
        }
  
        //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
        const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
        let dataLimite = new Date();
        let Agora = new Date();
  
        if (ticketTraking.chatbotAt !== null) {
          dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));
  
          if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
            return;
          }
        }
        
        await ticketTraking.update({
          chatbotAt: null
        });
  
        if (buttonActive.value === "text") {
          return botText();
        }
      }

    } catch (error) {
      Sentry.captureException(error);
    }
};

export const formatQueueInfo = (queue: Queue): string => {
  const scheduleInfo = formatScheduleInfo(queue.schedules);
  return `*${queue.name}*\n${scheduleInfo}`;
};
