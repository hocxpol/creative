import { Op } from "sequelize";
import Schedule from "../../models/Schedule";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  contactId?: number | string;
  userId?: number | string;
  pageNumber?: string | number;
  companyId: number;
}

interface Response {
  schedules: Schedule[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  contactId,
  userId,
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (Number(pageNumber) - 1) * limit;

  const whereCondition = {
    companyId,
    ...(searchParam && {
      [Op.or]: [
        { body: { [Op.like]: `%${searchParam}%` } },
        { "$contact.name$": { [Op.like]: `%${searchParam}%` } }
      ]
    }),
    ...(contactId && { contactId }),
    ...(userId && { userId })
  };

  const { count, rows: schedules } = await Schedule.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["sendAt", "DESC"]],
    include: [
      { model: Contact, as: "contact", attributes: ["id", "name"] },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
    ]
  });

  const hasMore = count > offset + schedules.length;

  return {
    schedules,
    count,
    hasMore
  };
};

export default ListService;
