import QuickMessage from "../../models/QuickMessage";
import AppError from "../../errors/AppError";
import { promises as fs } from "fs";
import { resolve } from "path";

const DeleteService = async (id: string): Promise<void> => {
  const record = await QuickMessage.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_QUICKMESSAGE_FOUND", 404);
  }

  // Se houver um arquivo associado, excluir o arquivo
  if (record.mediaName) {
    const filePath = resolve("public", "quickMessage", record.mediaName);
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (err) {
      // Ignora erro se o arquivo não existir
      console.error("Erro ao excluir arquivo:", err);
    }
  }

  await record.destroy();
};

export default DeleteService;
