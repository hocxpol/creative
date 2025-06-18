import path, { join } from "path";
import { promisify } from "util";
import { readFile, writeFile } from "fs";
import * as Sentry from "@sentry/node";
import { isNil, isNull, head } from "lodash";

// Importar as funções de validação do novo módulo
import { isNumeric, validaCpfCnpj, sanitizeName, keepOnlySpecifiedChars } from "../../utils/validation";

// Importar as funções de mensagem
import {
  getTypeMessage,
  getBodyMessage,
  getBodyButton,
  getQuotedMessage,
  getQuotedMessageId,
  isValidMsg,
  filterMessages
} from "../../utils/message";

// Importar os handlers de mensagem
import { verifyMessage, handleMsgAck } from "../../utils/message/handlers";

// Utils Media
import {
  downloadMedia,
  verifyMediaMessage,
  convertTextToSpeechAndSaveToFile,
  convertWavToAnotherFormat,
  deleteFileSync
} from "../../utils/media";

// Utils Contact
import {
  getMeSocket,
  getSenderMessage,
  getContactMessage,
  verifyContact
} from "../../utils/contact";

// Utils Queue
import { verifyQueue } from "../../utils/queue";

// Utils Chatbot
import { handleOpenAi, SessionOpenAi, sessionsOpenAi } from "../../utils/openai";

import { verifyRecentCampaign, verifyCampaignMessageAndCloseTicket } from "../../utils/campaign";

import { sendMessageImage, sendMessageLink, makeid } from "../../utils/send";

import { handleMessageIntegration } from "../../utils/integration";

import { verifyRating, handleRating } from '../../utils/rating';

import { handleMessage } from "../../utils/message/handlers";

import {
  downloadMediaMessage,
  extractMessageContent,
  getContentType,
  jidNormalizedUser,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageStubType,
  WAMessageUpdate,
  WASocket,
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import formatBody from "../../helpers/Mustache";
import { Store } from "../../libs/store";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op, Sequelize } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import Setting from "../../models/Setting";
import { cacheLayer } from "../../libs/cache";
import { provider } from "./providers";
import { debounce } from "../../helpers/Debounce";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import ffmpeg from "fluent-ffmpeg";
import {
  SpeechConfig,
  SpeechSynthesizer,
  AudioConfig
} from "microsoft-cognitiveservices-speech-sdk";
import QueueIntegrations from "../../models/QueueIntegrations";
import ShowQueueIntegrationService from "../QueueIntegrationServices/ShowQueueIntegrationService";

const request = require("request");

const fs = require('fs');

export type Session = WASocket & {
  id?: number;
  store?: Store;
};

export interface IMe {
  name: string;
  id: string;
}

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMessage {
  messages: WAMessage[];
  isLatest: boolean;
}

const writeFileAsync = promisify(writeFile);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleep(time) {
  await timeout(time);
}

const Push = (msg: proto.IWebMessageInfo) => {
  return msg.pushName;
}

const wbotMessageListener = async (wbot: Session, companyId: number): Promise<void> => {
  try {
    wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {    
      const messages = messageUpsert.messages
        .filter(filterMessages)
        .map(msg => msg);

      if (!messages.length) {
        return;
      }

      for (const message of messages) {
        try {          
          const messageExists = await Message.count({
            where: { id: message.key.id!, companyId }
          });

          if (!messageExists) {
            await handleMessage(message, wbot, companyId);
            await verifyRecentCampaign(message, companyId);
            await verifyCampaignMessageAndCloseTicket(message, companyId);
          }
        } catch (error) {
          Sentry.captureException(error);
        }
      }
    });

    wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return;
            
      messageUpdate.forEach(async (message: WAMessageUpdate) => {
        try {
          (wbot as WASocket)!.readMessages([message.key]);
          await handleMsgAck(message, message.update.status);
        } catch (error) {
          Sentry.captureException(error);
        }
      });
    });

    // wbot.ev.on("messages.set", async (messageSet: IMessage) => {
    //   messageSet.messages.filter(filterMessages).map(msg => msg);
    // });
  } catch (error) {
    Sentry.captureException(error);
  }
};

export { wbotMessageListener };
