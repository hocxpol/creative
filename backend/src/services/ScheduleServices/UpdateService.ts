import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import ShowService from "./ShowService";
import Whatsapp from "../../models/Whatsapp";

interface ScheduleData {
  id?: number;
  body?: string;
  sendAt?: string;
  sentAt?: string;
  contactId?: number;
  companyId?: number;
  ticketId?: number;
  userId?: number;
  whatsappId?: number;
}

interface Request {
  scheduleData: ScheduleData;
  id: string | number;
  companyId: number;
}

const UpdateUserService = async ({
  scheduleData,
  id,
  companyId
}: Request): Promise<Schedule | undefined> => {
  const schedule = await ShowService(id, companyId);

  if (schedule?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  const schema = Yup.object().shape({
    body: Yup.string().min(5),
    sendAt: Yup.string(),
    contactId: Yup.number(),
    userId: Yup.number(),
    whatsappId: Yup.number()
  });

  const {
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
    whatsappId,
  } = scheduleData;

  try {
    await schema.validate({ body, sendAt, contactId, userId, whatsappId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Se houver mudança de WhatsApp, verifica se o novo WhatsApp existe
  if (whatsappId) {
    const whatsapp = await Whatsapp.findOne({
      where: { id: whatsappId, companyId }
    });
    if (!whatsapp) {
      throw new AppError("WhatsApp não encontrado");
    }
  }

  await schedule.update({
    body,
    sendAt,
    sentAt,
    contactId,
    ticketId,
    userId,
    whatsappId,
  });

  await schedule.reload();
  return schedule;
};

export default UpdateUserService;
