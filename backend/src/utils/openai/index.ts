import { IMe, Session } from "../../services/WbotServices/wbotMessageListener";
import { proto } from "@whiskeysockets/baileys";
import { isNil } from "lodash";
import path from "path";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowWhatsAppService from "../../services/WhatsappService/ShowWhatsAppService";
import { getBodyMessage } from "../message";
import { verifyMessage } from "../message/handlers";
import { verifyMediaMessage } from "../media";
import { keepOnlySpecifiedChars } from "../validation";
import { convertTextToSpeechAndSaveToFile, deleteFileSync } from "../media";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import { makeid } from "../send";
import { sanitizeName } from "../validation";
import { transferQueue } from "../integration";

interface SessionOpenAi extends OpenAIApi {
  id?: number;
}

const sessionsOpenAi: SessionOpenAi[] = [];

export const handleOpenAi = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  mediaSent: Message | undefined
): Promise<void> => {
  const bodyMessage = getBodyMessage(msg);

  if (!bodyMessage) return;

  let { prompt } = await ShowWhatsAppService(wbot.id, ticket.companyId);

  if (!prompt && !isNil(ticket?.queue?.prompt)) {
    prompt = ticket.queue.prompt;
  }

  if (!prompt) return;

  if (msg.messageStubType) return;

  const publicFolder: string = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "public"
  );

  let openai: SessionOpenAi;
  const openAiIndex = sessionsOpenAi.findIndex(s => s.id === wbot.id);

  if (openAiIndex === -1) {
    const configuration = new Configuration({
      apiKey: prompt.apiKey
    });
    openai = new OpenAIApi(configuration);
    openai.id = wbot.id;
    sessionsOpenAi.push(openai);
  } else {
    openai = sessionsOpenAi[openAiIndex];
  }

  const messages = await Message.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
    limit: prompt.maxMessages
  });

  const promptSystem = `Nas respostas utilize o nome ${sanitizeName(
    contact.name || "Amigo(a)"
  )} para identificar o cliente.\nSua resposta deve usar no máximo ${prompt.maxTokens
    } tokens e cuide para não truncar o final.\nSempre que possível, mencione o nome dele para ser mais personalizado o atendimento e mais educado. Quando a resposta requer uma transferência para o setor de atendimento, comece sua resposta com 'Ação: Transferir para o setor de atendimento'.\n
  ${prompt.prompt}\n`;

  let messagesOpenAi: ChatCompletionRequestMessage[] = [];

  if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
    messagesOpenAi = [];
    messagesOpenAi.push({ role: "system", content: promptSystem });
    for (
      let i = 0;
      i < Math.min(prompt.maxMessages, messages.length);
      i++
    ) {
      const message = messages[i];
      if (message.mediaType === "chat") {
        if (message.fromMe) {
          messagesOpenAi.push({ role: "assistant", content: message.body });
        } else {
          messagesOpenAi.push({ role: "user", content: message.body });
        }
      }
    }
    messagesOpenAi.push({ role: "user", content: bodyMessage! });

    const chat = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-1106",
      messages: messagesOpenAi,
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature
    });

    let response = chat.data.choices[0].message?.content;

    if (response?.includes("Ação: Transferir para o setor de atendimento")) {
      await transferQueue(prompt.queueId, ticket, contact);
      response = response
        .replace("Ação: Transferir para o setor de atendimento", "")
        .trim();
    }

    // Envia a resposta como texto
    await wbot.sendMessage(
      msg.key.remoteJid!,
      { text: response! }
    );

    // Se a resposta for longa, também envia como áudio
    if (response!.length > 100) {
      const fileName = `${makeid(10)}.mp3`;
      const filePath = path.join(publicFolder, fileName);

      try {
        await convertTextToSpeechAndSaveToFile(
          response!,
          filePath,
          prompt.voiceKey,
          prompt.voiceRegion,
          "pt-BR-FabioNeural",
          "mp3"
        );
        await wbot.sendMessage(
          msg.key.remoteJid!,
          { audio: { url: filePath }, mimetype: "audio/mp3" }
        );
        deleteFileSync(filePath);
      } catch (err) {

      }
    }
  }
};

export { SessionOpenAi, sessionsOpenAi };
