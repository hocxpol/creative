import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import { isNil } from "lodash";
import { logger } from "../../utils/logger";
import * as Sentry from "@sentry/node";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  extraInfo?: ExtraInfo[];
  whatsappId?: number;
  description?: string;
}

const CreateOrUpdateContactService = async ({
  name,
  number,
  isGroup = false,
  email = "",
  profilePicUrl,
  companyId,
  extraInfo = [],
  whatsappId,
  description = ""
}: Request): Promise<Contact> => {
  try {
    // Sanitiza o número de telefone
    const sanitizedNumber = number.replace(/\D/g, "");

    // Busca contato existente
    const contact = await Contact.findOne({
      where: { number: sanitizedNumber, companyId }
    });

    // Prepara dados do contato
    const contactData = {
      name: contact ? contact.name : (name || sanitizedNumber),
      number: sanitizedNumber,
      email,
      profilePicUrl,
      isGroup,
      companyId,
      whatsappId,
      description
    };

    if (contact) {
      // Atualiza contato existente
      await contact.update(contactData);

      // Atualiza campos extras se fornecidos
      if (extraInfo.length > 0) {
        await ContactCustomField.destroy({
          where: { contactId: contact.id }
        });

        await ContactCustomField.bulkCreate(
          extraInfo.map(info => ({
            ...info,
            contactId: contact.id
          }))
        );
      }

      // Notifica atualização
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
        action: "update",
        contact
      });

      return contact;
    } else {
      // Cria novo contato
      const newContact = await Contact.create(contactData, {
        include: ["extraInfo"]
      });

      // Adiciona campos extras se fornecidos
      if (extraInfo.length > 0) {
        await ContactCustomField.bulkCreate(
          extraInfo.map(info => ({
            ...info,
            contactId: newContact.id
          }))
        );
      }

      // Notifica criação
      const io = getIO();
      io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
        action: "create",
        contact: newContact
      });

      return newContact;
    }
  } catch (error) {
    logger.error('Erro ao criar/atualizar contato:', error);
    Sentry.captureException(error);
    throw error;
  }
};

export default CreateOrUpdateContactService;
