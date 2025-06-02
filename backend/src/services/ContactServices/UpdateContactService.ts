import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";

interface ExtraInfo {
  id?: number;
  name: string;
  value: string;
}

interface ContactData {
  email?: string;
  number?: string;
  name?: string;
  extraInfo?: ExtraInfo[];
  cpf?: string;
  cnpj?: string;
  birthDate?: Date;
  gender?: string;
  automation?: boolean;
  internalCode?: string;
  queueId?: number;
}

interface Request {
  contactData: ContactData;
  contactId: string;
  companyId: number;
}

const UpdateContactService = async ({
  contactData,
  contactId,
  companyId
}: Request): Promise<Contact> => {
  const { 
    email, 
    name, 
    number, 
    extraInfo,
    cpf,
    cnpj,
    birthDate,
    gender,
    automation,
    internalCode,
    queueId
  } = contactData;

  const contact = await Contact.findOne({
    where: { id: contactId },
    attributes: [
      "id", 
      "name", 
      "number", 
      "email", 
      "companyId", 
      "profilePicUrl",
      "cpf",
      "cnpj",
      "birthDate",
      "gender",
      "automation",
      "internalCode",
      "queueId"
    ],
    include: ["extraInfo"]
  });

  if (contact?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  if (extraInfo) {
    await Promise.all(
      extraInfo.map(async (info: any) => {
        await ContactCustomField.upsert({ ...info, contactId: contact.id });
      })
    );

    await Promise.all(
      contact.extraInfo.map(async oldInfo => {
        const stillExists = extraInfo.findIndex(info => info.id === oldInfo.id);

        if (stillExists === -1) {
          await ContactCustomField.destroy({ where: { id: oldInfo.id } });
        }
      })
    );
  }

  await contact.update({
    name,
    number,
    email,
    cpf,
    cnpj,
    birthDate,
    gender,
    automation,
    internalCode,
    queueId
  });

  await contact.reload({
    attributes: [
      "id", 
      "name", 
      "number", 
      "email", 
      "profilePicUrl",
      "cpf",
      "cnpj",
      "birthDate",
      "gender",
      "automation",
      "internalCode",
      "queueId"
    ],
    include: ["extraInfo"]
  });

  return contact;
};

export default UpdateContactService;
