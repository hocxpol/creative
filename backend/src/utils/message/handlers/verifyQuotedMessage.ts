import { proto } from "@whiskeysockets/baileys";
import Message from "../../../models/Message";
import { extractMessageContent } from "@whiskeysockets/baileys";
import { getQuotedMessageId } from "../index";

export const verifyQuotedMessage = async (
    msg: proto.IWebMessageInfo
  ): Promise<Message | null> => {
    if (!msg) return null;
    const quoted = getQuotedMessageId(msg);
  
    if (!quoted) return null;
  
    const quotedMsg = await Message.findOne({
      where: { id: quoted }
    });
  
    if (!quotedMsg) return null;
  
    return quotedMsg;
  };
