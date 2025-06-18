import AppError from "../../errors/AppError";
import QuickMessage from "../../models/QuickMessage";
import { Op } from "sequelize";

interface Data {
  shortcode: string;
  message: string;
  userId: number | string;
  id?: number | string;
  companyId?: number | string;
  visibility?: string;
}

const UpdateService = async (data: Data): Promise<QuickMessage> => {
  const { id, shortcode, message, userId, companyId, visibility } = data;

  const record = await QuickMessage.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  // Check if shortcut already exists for this company (excluding current record)
  const existingShortcut = await QuickMessage.findOne({
    where: { 
      shortcode,
      companyId,
      id: { [Op.ne]: id } // Exclude current record
    }
  });

  if (existingShortcut) {
    throw new AppError("ERR_QUICKMESSAGE_SHORTCUT_ALREADY_EXISTS");
  }

  await record.update({
    shortcode,
    message,
    userId,
    visibility
  });

  return record;
};

export default UpdateService;
