import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";

interface Request {
  body: string;
  sendAt: string;
  contactId: number | string;
  companyId: number | string;
  userId?: number | string;
  whatsappId: number | string;
}

const CreateService = async ({
  body,
  sendAt,
  contactId,
  companyId,
  userId,
  whatsappId
}: Request): Promise<Schedule> => {
  const schema = Yup.object().shape({
    body: Yup.string().required().min(5),
    sendAt: Yup.string().required(),
    contactId: Yup.number().required(),
    whatsappId: Yup.number().required()
  });

  try {
    await schema.validate({ body, sendAt, contactId, whatsappId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Busca o contato
  const contact = await Contact.findByPk(Number(contactId));
  if (!contact) {
    throw new AppError("Contato não encontrado");
  }

  // Busca o WhatsApp selecionado
  const whatsapp = await Whatsapp.findOne({
    where: { id: Number(whatsappId), companyId: Number(companyId) }
  });
  if (!whatsapp) {
    throw new AppError("WhatsApp não encontrado");
  }

  // Cria ou encontra um ticket para o contato
  const ticket = await FindOrCreateTicketService(
    contact,
    whatsapp.id,
    0,
    Number(companyId)
  );

  try {
    const schedule = await Schedule.create(
      {
        body,
        sendAt,
        contactId: Number(contactId),
        companyId: Number(companyId),
        userId: userId ? Number(userId) : null,
        ticketId: ticket.id,
        whatsappId: Number(whatsappId),
        status: 'PENDENTE'
      }
    );

    await schedule.reload();
    return schedule;
  } catch (err) {
    throw new AppError("Erro ao criar agendamento: " + err.message);
  }
};

export default CreateService;
