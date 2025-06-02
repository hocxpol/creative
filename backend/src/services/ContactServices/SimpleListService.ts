import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { FindOptions, Op } from "sequelize";
import Queue from "../../models/Queue";

export interface SearchContactParams {
  companyId: string | number;
  name?: string;
}

const SimpleListService = async ({ name, companyId }: SearchContactParams): Promise<Contact[]> => {
  let options: FindOptions = {
    order: [
      ['name', 'ASC']
    ],
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
    include: [
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name"]
      }
    ]
  }

  if (name) {
    options.where = {
      [Op.or]: [
        {
          name: {
            [Op.like]: `%${name}%`
          }
        },
        {
          cpf: {
            [Op.like]: `%${name}%`
          }
        },
        {
          cnpj: {
            [Op.like]: `%${name}%`
          }
        },
        {
          internalCode: {
            [Op.like]: `%${name}%`
          }
        }
      ]
    }
  }

  options.where = {
    ...options.where,
    companyId
  }

  const contacts = await Contact.findAll({
    ...options,
    subQuery: false
  });

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default SimpleListService;
