import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import moment from "moment";

import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import GetContactService from "../services/ContactServices/GetContactService";

import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import AppError from "../errors/AppError";
import SimpleListService, {
  SearchContactParams
} from "../services/ContactServices/SimpleListService";
import ContactCustomField from "../models/ContactCustomField";
import { validateCPF, validateCNPJ } from "../utils/validateDocument";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexGetContactQuery = {
  name: string;
  number: string;
};

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ExtraInfo[];
  cpf?: string;
  cnpj?: string;
  birthDate?: Date;
  gender?: string;
  automation?: boolean;
  internalCode?: string;
  queueId?: number;
  whatsappId?: number;
}

const convertBirthDateToISO = (birthDate: string | undefined): Date | undefined => {
  if (!birthDate) return undefined;
  return moment(birthDate).startOf('day').utc().toDate();
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;
  const { companyId } = req.user;

  const contact = await GetContactService({
    name,
    number,
    companyId
  });

  return res.status(200).json(contact);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const contactData: ContactData = req.body;
  
  // Converte a data se existir
  if (contactData.birthDate) {
    contactData.birthDate = convertBirthDateToISO(contactData.birthDate as unknown as string);
  }
  
  contactData.number = contactData.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "ERR_INVALID_NUMBER_FORMAT"),
    email: Yup.string().nullable().email(),
    cpf: Yup.string().nullable().test('cpf', 'ERR_INVALID_CPF', function(value) {
      if (!value) return true;
      return validateCPF(value);
    }),
    cnpj: Yup.string().nullable().test('cnpj', 'ERR_INVALID_CNPJ', function(value) {
      if (!value) return true;
      return validateCNPJ(value);
    }),
    birthDate: Yup.date().nullable().transform((value) => {
      if (!value) return null;
      return moment(value).isValid() ? moment(value).startOf('day').toDate() : null;
    }),
    gender: Yup.string().nullable().oneOf(['M', 'F', 'O', null]),
    automation: Yup.boolean().nullable(),
    internalCode: Yup.string().nullable(),
    queueId: Yup.number().nullable().when('automation', {
      is: false,
      then: Yup.number().required('ERR_QUEUE_REQUIRED_WHEN_AUTOMATION_DISABLED')
    }),
    whatsappId: Yup.number().nullable()
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await CheckIsValidContact(contactData.number, companyId);
  const validNumber = await CheckContactNumber(contactData.number, companyId);
  contactData.number = validNumber.jid.replace(/\D/g, "");

  /**
   * Código desabilitado por demora no retorno
   */
  // const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId);

  const contact = await CreateContactService({
    ...contactData,
    // profilePicUrl,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowContactService(contactId, companyId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;
  const { contactId } = req.params;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string().matches(
      /^\d+$/,
      "ERR_INVALID_NUMBER_FORMAT"
    ),
    email: Yup.string().nullable().email(),
    cpf: Yup.string().nullable().test('cpf', 'ERR_INVALID_CPF', function(value) {
      if (!value) return true;
      return validateCPF(value);
    }),
    cnpj: Yup.string().nullable().test('cnpj', 'ERR_INVALID_CNPJ', function(value) {
      if (!value) return true;
      return validateCNPJ(value);
    }),
    birthDate: Yup.date().nullable().transform((value) => {
      if (!value) return null;
      return moment(value).isValid() ? moment(value).startOf('day').toDate() : null;
    }),
    gender: Yup.string().nullable().oneOf(['M', 'F', 'O', null]),
    automation: Yup.boolean().nullable(),
    internalCode: Yup.string().nullable(),
    queueId: Yup.number().nullable().when('automation', {
      is: false,
      then: Yup.number().required('ERR_QUEUE_REQUIRED_WHEN_AUTOMATION_DISABLED')
    }),
    whatsappId: Yup.number().nullable()
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await CheckIsValidContact(contactData.number, companyId);
  const validNumber = await CheckContactNumber(contactData.number, companyId);
  contactData.number = validNumber.jid.replace(/\D/g, "");

  // Converte a data se existir
  if (contactData.birthDate) {
    contactData.birthDate = convertBirthDateToISO(contactData.birthDate as unknown as string);
  }

  const contact = await UpdateContactService({
    contactData,
    contactId,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
    action: "update",
    contact
  });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  await ShowContactService(contactId, companyId);

  await DeleteContactService(contactId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
    action: "delete",
    contactId
  });

  return res.status(200).json({ message: "ERR_CONTACT_DELETED" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.query as unknown as SearchContactParams;
  const { companyId } = req.user;

  const contacts = await SimpleListService({ name, companyId });

  return res.json(contacts);
};
