import { Op } from "sequelize";
import QuickMessage from "../../models/QuickMessage";
import Company from "../../models/Company";

type Params = {
  companyId: string | number;
  userId: string | number;
};

const FindService = async ({ companyId, userId }: Params): Promise<QuickMessage[]> => {
  const notes: QuickMessage[] = await QuickMessage.findAll({
    where: {
      companyId: Number(companyId),
      [Op.or]: [
        { userId: Number(userId) },
        { visibility: "all" }
      ]
    },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["shortcode", "ASC"]]
  });

  return notes;
};

export default FindService;
