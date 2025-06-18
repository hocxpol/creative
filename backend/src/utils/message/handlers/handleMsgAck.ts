import { proto } from "@whiskeysockets/baileys";
import { getIO } from "../../../libs/socket";
import { logger } from "../../../utils/logger";
import Message from "../../../models/Message";
import { WAMessage } from "@whiskeysockets/baileys";

export const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise((r) => setTimeout(r, 500));
  const io = getIO();

  try {
    if (chat === undefined) return;

    const messageToUpdate = await Message.findOne({
      where: { id: msg.key.id },
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"],
        },
      ],
    });

    if (!messageToUpdate) return;

    if (messageToUpdate.ack !== chat) {
      await messageToUpdate.update({ ack: chat });
      
      io.to(messageToUpdate.ticketId.toString()).emit(
        `company-${messageToUpdate.companyId}-appMessage`,
        {
          action: "update",
          message: messageToUpdate,
        }
      );
    }
  } catch (err) {
    logger.error(err);
  }
};