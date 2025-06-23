import { Op } from "sequelize";
import QuickMessage from "../../models/QuickMessage";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  userId: number;
  companyId: number;
}

interface Response {
  quickMessages: QuickMessage[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  userId,
  companyId
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (Number(pageNumber) - 1) * limit;

  const whereCondition: any = {
    companyId,
    [Op.or]: [
      { userId },
      { visibility: "all" }
    ]
  };

  if (searchParam) {
    whereCondition[Op.and] = [
      {
        [Op.or]: [
          {
            shortcode: {
              [Op.like]: `%${searchParam}%`
            }
          },
          {
            message: {
              [Op.like]: `%${searchParam}%`
            }
          }
        ]
      }
    ];
  }

  const { count, rows: quickMessages } = await QuickMessage.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + quickMessages.length;

  return {
    quickMessages,
    count,
    hasMore
  };
};

export default ListService;
