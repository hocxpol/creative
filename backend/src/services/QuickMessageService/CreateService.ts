import * as Yup from "yup";
import AppError from "../../errors/AppError";
import QuickMessage from "../../models/QuickMessage";

interface Data {
  shortcode: string;
  message: string;
  companyId: number | string;
  userId: number | string;
  visibility?: string;
}

const CreateService = async (data: Data): Promise<QuickMessage> => {
  const { shortcode, message, companyId, visibility } = data;

  const ticketnoteSchema = Yup.object().shape({
    shortcode: Yup.string()
      .min(3, "ERR_QUICKMESSAGE_INVALID_NAME")
      .required("ERR_QUICKMESSAGE_REQUIRED"),
    message: Yup.string()
      .min(3, "ERR_QUICKMESSAGE_INVALID_NAME")
      .required("ERR_QUICKMESSAGE_REQUIRED"),
    visibility: Yup.string()
      .oneOf(["me", "all"], "ERR_QUICKMESSAGE_INVALID_VISIBILITY")
      .required("ERR_QUICKMESSAGE_VISIBILITY_REQUIRED")
  });

  try {
    await ticketnoteSchema.validate({ shortcode, message, visibility });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Check if shortcut already exists for this company
  const existingShortcut = await QuickMessage.findOne({
    where: { 
      shortcode,
      companyId
    }
  });

  if (existingShortcut) {
    throw new AppError("ERR_QUICKMESSAGE_SHORTCUT_ALREADY_EXISTS");
  }

  const record = await QuickMessage.create({
    ...data,
    visibility: visibility || "me" // Default to "me" if not provided
  });

  return record;
};

export default CreateService;
