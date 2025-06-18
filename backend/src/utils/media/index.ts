import path, { join } from "path";
import { promisify } from "util";
import { writeFile, unlinkSync } from "fs";
import * as Sentry from "@sentry/node";
import { logger } from "../logger";
import ffmpeg from "fluent-ffmpeg";
import {
  SpeechConfig,
  SpeechSynthesizer,
  AudioConfig
} from "microsoft-cognitiveservices-speech-sdk";
import {
  downloadMediaMessage,
  proto,
  WAMessage
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import CreateMessageService from "../../services/MessageServices/CreateMessageService";
import formatBody from "../../helpers/Mustache";
import Queue from "../../models/Queue";
import User from "../../models/User";

const writeFileAsync = promisify(writeFile);

/**
 * Baixa a mídia de uma mensagem
 */
export const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  let buffer;
  try {
    buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {}
    );
  } catch (err) {

  }

  let filename = msg.message?.documentMessage?.fileName || "";

  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

  if (!mineType) {

  }

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  } else {
    filename = `${new Date().getTime()}_${filename}`;
  }

  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };

  return media;
};

/**
 * Verifica e processa mensagens com mídia
 */
export const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const io = getIO();  
  const media = await downloadMedia(msg);
  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  try {
    const filePath = join(__dirname, "..", "..", "..", "public", media.filename);
    await writeFileAsync(filePath, media.data, "base64");
  } catch (err) {
    Sentry.captureException(err);
  }

  let body;
  if (msg.key.fromMe) {
    body = msg.message?.videoMessage?.caption || 
           msg.message?.imageMessage?.caption ||
           msg.message?.documentMessage?.caption ||
           msg.message?.documentMessage?.title;
  } else {
    body = msg.message?.videoMessage?.caption || 
           msg.message?.imageMessage?.caption ||
           msg.message?.documentMessage?.caption ||
           msg.message?.documentMessage?.title ||
           media.filename;
  }

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body ? formatBody(body, ticket.contact) : media.filename,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
  };

  await ticket.update({
    lastMessage: body || media.filename,
  });

  const newMessage = await CreateMessageService({
    messageData,
    companyId: ticket.companyId,
  });

  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" },
      ],
    });

    io.to(`company-${ticket.companyId}-closed`)
      .to(`queue-${ticket.queueId}-closed`)
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

  return newMessage;
};

/**
 * Converte texto em fala e salva em arquivo
 */
export const convertTextToSpeechAndSaveToFile = (
  text: string,
  filename: string,
  subscriptionKey: string,
  serviceRegion: string,
  voice: string = "pt-BR-FabioNeural",
  audioToFormat: string = "mp3"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );
    speechConfig.speechSynthesisVoiceName = voice;
    const audioConfig = AudioConfig.fromAudioFileOutput(`${filename}.wav`);
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result) {
          convertWavToAnotherFormat(
            `${filename}.wav`,
            `${filename}.${audioToFormat}`,
            audioToFormat
          )
            .then(output => {
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        } else {
          reject(new Error("No result from synthesizer"));
        }
        synthesizer.close();
      },
      error => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

/**
 * Converte arquivo WAV para outro formato
 */
export const convertWavToAnotherFormat = (
  inputPath: string,
  outputPath: string,
  toFormat: string
) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .toFormat(toFormat)
      .on("end", () => resolve(outputPath))
      .on("error", (err: { message: any }) =>
        reject(new Error(`Error converting file: ${err.message}`))
      )
      .save(outputPath);
  });
};

/**
 * Deleta um arquivo do sistema
 */
export const deleteFileSync = (path: string): void => {
  try {
    unlinkSync(path);
  } catch (error) {
  }
};
