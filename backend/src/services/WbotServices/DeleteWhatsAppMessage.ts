import { proto, WASocket } from "@whiskeysockets/baileys";
import WALegacySocket from "@whiskeysockets/baileys"
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

const DeleteWhatsAppMessage = async (messageId: string): Promise<{ message: Message; ticket: Ticket }> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  const messageToDelete = await GetWbotMessage(ticket, messageId);

  try {
    const wbot = await GetTicketWbot(ticket);
    const messageDelete = messageToDelete as proto.WebMessageInfo;

    const menssageDelete = messageToDelete as Message;

    await (wbot as WASocket).sendMessage(menssageDelete.remoteJid, {
      delete: {
        id: menssageDelete.id,
        remoteJid: menssageDelete.remoteJid,
        participant: menssageDelete.participant,
        fromMe: menssageDelete.fromMe
      }
    });

  } catch (err) {
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }
  await message.update({ isDeleted: true });

  // Atualiza o campo lastMessage do ticket se a mensagem apagada for a última
  if (ticket && ticket.lastMessage === message.body) {
    await ticket.update({ lastMessage: "Essa mensagem foi apagada pelo contato." });
  }
  // Recarrega o ticket com todas as associações necessárias
  const updatedTicket = await Ticket.findByPk(ticket.id, {
    include: [
      { model: Contact, as: "contact" },
      { model: Queue, as: "queue" },
      { model: User, as: "user" },
      { model: Whatsapp, as: "whatsapp" }
    ]
  });

  if (!updatedTicket) {
    throw new AppError("Error reloading ticket after message deletion");
  }

  return { message, ticket: updatedTicket };
};

export default DeleteWhatsAppMessage;
