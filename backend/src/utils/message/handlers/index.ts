import { proto } from "@whiskeysockets/baileys";
import { IMe, Session } from "../../../services/WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import { getIO } from "../../../libs/socket";
import { getBodyMessage, getTypeMessage, isValidMsg } from "..";
import { logger } from "../../../utils/logger";
import * as Sentry from "@sentry/node";
import CreateMessageService from "../../../services/MessageServices/CreateMessageService";
import { getContactMessage, verifyContact } from "../../contact";
import ShowWhatsAppService from "../../../services/WhatsappService/ShowWhatsAppService";
import { cacheLayer } from "../../../libs/cache";
import FindOrCreateTicketService from "../../../services/TicketServices/FindOrCreateTicketService";
import { verifyQueue } from "../../queue";
import FindOrCreateATicketTrakingService from "../../../services/TicketServices/FindOrCreateATicketTrakingService";
import { verifyRating, handleRating } from "../../rating";
import { verifyMediaMessage } from "../../media";
import VerifyCurrentSchedule from "../../../services/CompanyService/VerifyCurrentSchedule";
import moment from "moment";
import { handleOpenAi } from "../../openai";
import ShowQueueIntegrationService from "../../../services/QueueIntegrationServices/ShowQueueIntegrationService";
import { handleMessageIntegration } from "../../integration";
import { handleChartbot } from "../../chatbot";
import { verifyKeyword } from "../../queue/keyword";

import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import Queue from "../../../models/Queue";
import Setting from "../../../models/Setting";
import User from "../../../models/User";
import Contact from "../../../models/Contact";
import Whatsapp from "../../../models/Whatsapp";
import UpdateTicketService from "../../../services/TicketServices/UpdateTicketService";

import { verifyQuotedMessage } from "./verifyQuotedMessage";
import { sendOutOfHoursMessage } from "./sendOutOfHoursMessage";
import { checkOutOfHours } from "./checkOutOfHours";
import { verifyMessage } from "./verifyMessage";
import { handleMessage } from "./handleMessage";
import { handleMsgAck } from "./handleMsgAck";

export {
	verifyQuotedMessage,
	sendOutOfHoursMessage,
	checkOutOfHours,
	verifyMessage,
	handleMessage,
	handleMsgAck
};
