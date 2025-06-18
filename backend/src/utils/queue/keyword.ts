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
import { getBodyMessage, getTypeMessage } from "../message";
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
import { logger } from "../../utils/logger";
import { verifyQueue } from "./index";
import VerifyCurrentSchedule from "../../services/QueueService/VerifyCurrentSchedule";

/**
 * Verifica se a mensagem recebida corresponde a alguma keyword de fila.
 * Se corresponder, associa o ticket à fila e processa as opções.
 * 
 * Esta função permite acesso a filas invisíveis através de palavras-chave.
 * O fluxo é similar ao verifyQueue, mas sem a necessidade de seleção de fila.
 * 
 * @param wbot - Sessão do WhatsApp
 * @param msg - Mensagem recebida
 * @param ticket - Ticket atual
 * @param contact - Contato que enviou a mensagem
 * @param mediaSent - Mídia enviada (opcional)
 */
export const verifyKeyword = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  mediaSent?: Message | undefined
): Promise<boolean> => {
  try {
    const timestamp = new Date().toISOString();
    const companyId = ticket.companyId;
    const body = getBodyMessage(msg);

    // Verifica se o ticket já está em uma fila e não está pendente
    if (ticket.queueId && ticket.status !== "pending") {
      return false;
    }

    // Busca todas as filas do WhatsApp, incluindo invisíveis
    const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(
      wbot.id!,
      ticket.companyId
    );

    // Procura por uma fila cuja keyword corresponda à mensagem
    const bodyTrimmed = body.trim();
    const bodyLower = bodyTrimmed.toLowerCase();

    const matchedQueue = queues.find(q => {
      if (!q.keyword) return false;
      const qKeywordTrimmed = q.keyword.trim();
      const qKeywordLower = qKeywordTrimmed.toLowerCase();
      const matches = qKeywordLower === bodyLower;
      return matches;
    });

    if (!matchedQueue) return false;

    // Atualiza o ticket para associar à fila encontrada imediatamente
    await UpdateTicketService({
      ticketData: { 
        queueId: matchedQueue.id,
        status: "pending",
        chatbot: true
      },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    // Verifica o horário de funcionamento da fila
    const scheduleType = await Setting.findOne({
      where: {
        companyId,
        key: "scheduleType"
      }
    });

    // Só verifica o horário se o scheduleType não estiver desabilitado
    if (scheduleType && scheduleType.value !== "disabled") {
      const queue = await Queue.findByPk(matchedQueue.id);
      
      if (queue.outOfHoursMessage) {
        const queueSchedule = await VerifyCurrentSchedule(queue.id);
        
        if (!queueSchedule.inActivity) {
          const body = formatBody(`\u200e ${queue.outOfHoursMessage}\n\n*[ # ]* - Menu inicial`, ticket.contact);
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: body }
          );
          await verifyMessage(sentMessage, ticket, contact);
          return false;
        }
      }
    }

    // Verifica limites de uso do chatbot
    if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
      return false;
    }

    // Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
    const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
    let dataLimite = new Date();
    let Agora = new Date();

    if (ticketTraking.chatbotAt !== null) {
      dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));

      if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
        return false;
      }
    }

    // Reseta o tempo de uso do chatbot
    await ticketTraking.update({
      chatbotAt: null
    });

    // Verifica se a fila tem opções para ativar o chatbot
    let chatbot = false;
    if (matchedQueue?.options) {
      chatbot = matchedQueue.options.length > 0;
    }

    //inicia integração dialogflow/n8n
    if (!msg.key.fromMe && !ticket.isGroup && !isNil(matchedQueue.integrationId)) {
      const integrations = await ShowQueueIntegrationService(matchedQueue.integrationId, companyId);
      await handleMessageIntegration(msg, wbot, integrations, ticket);
      await ticket.update({
        useIntegration: true,
        integrationId: integrations.id
      });
      return true;
    }

    //inicia integração openai
    if (!msg.key.fromMe && !ticket.isGroup && !isNil(matchedQueue.promptId)) {
      await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
      await ticket.update({
        useIntegration: true,
        promptId: matchedQueue.promptId
      });
      return true;
    }

    // Se não houver integração, processa as opções normalmente
    if (chatbot && !msg.key.fromMe) {
      // Verifica se o usuário quer voltar ao menu principal
      if (body === "0" || body === "#") {
        await UpdateTicketService({
          ticketData: { 
            queueId: null,
            chatbot: false,
            queueOptionId: null
          },
          ticketId: ticket.id,
          companyId: ticket.companyId
        });
        await verifyQueue(wbot, msg, ticket, contact);
        return true;
      }

      // Verifica o tipo de exibição do chatbot (texto ou botão)
      const buttonActive = await Setting.findOne({
        where: {
          key: "chatBotType",
          companyId
        }
      });

      // Função para enviar mensagem com opções em formato texto
      const botText = async () => {
        // Buscar as opções da fila
        const queueOptions = await QueueOption.findAll({
          where: { queueId: matchedQueue.id, parentId: null },
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
          text: formatBody(`\u200e*${matchedQueue.name}*\n\n${matchedQueue.greetingMessage}\n\n${options}`, ticket.contact),
        };

        // Usa debounce para evitar spam de mensagens
        const debouncedSentMessage = debounce(
          async () => {
            const sendMsg = await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              textMessage
            );
            await verifyMessage(sendMsg, ticket, contact);
          },
          1500,
          ticket.id
        );
        debouncedSentMessage();
      };

      // Se o tipo de exibição for texto, envia as opções
      if (buttonActive.value === "text") {
        await botText();
        return true;
      }
    }

    // Atualiza o ticket para manter o chatbot ativo
    await UpdateTicketService({
      ticketData: { 
        chatbot: true,
        queueOptionId: null // Reseta o queueOptionId para permitir novas seleções
      },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
}; 
