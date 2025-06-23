import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";
import * as path from "path";
import * as fs from "fs";
import Schedule from "../models/Schedule";
import AppError from "../errors/AppError";
import { Multer } from "multer";

import CreateService from "../services/ScheduleServices/CreateService";
import ListService from "../services/ScheduleServices/ListService";
import UpdateService from "../services/ScheduleServices/UpdateService";
import ShowService from "../services/ScheduleServices/ShowService";
import DeleteService from "../services/ScheduleServices/DeleteService";

type IndexQuery = {
  searchParam?: string;
  contactId?: number | string;
  userId?: number | string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, userId, pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { schedules, count, hasMore } = await ListService({
    searchParam,
    contactId,
    userId,
    pageNumber,
    companyId
  });

  return res.json({ schedules, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    body,
    sendAt,
    contactId,
    userId,
    whatsappId
  } = req.body;
  const { companyId } = req.user;

  const schedule = await CreateService({
    body,
    sendAt,
    contactId,
    companyId,
    userId,
    whatsappId
  });

  const io = getIO();
  io.to(`company-${companyId}-schedule`).emit("schedule", {
    action: "create",
    schedule
  });

  return res.status(200).json(schedule);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { scheduleId } = req.params;
  const { companyId } = req.user;

  const schedule = await ShowService(scheduleId, companyId);

  return res.status(200).json(schedule);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { scheduleId } = req.params;
  const scheduleData = req.body;
  const { companyId } = req.user;

  const schedule = await UpdateService({ scheduleData, id: scheduleId, companyId });

  const io = getIO();
  io.to(`company-${companyId}-schedule`).emit("schedule", {
    action: "update",
    schedule
  });

  return res.status(200).json(schedule);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { scheduleId } = req.params;
  const { companyId } = req.user;

  await DeleteService(scheduleId, companyId);

  const io = getIO();
  io.to(`company-${companyId}-schedule`).emit("schedule", {
    action: "delete",
    scheduleId
  });

  return res.status(200).json({ message: "Schedule deleted" });
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  const mediaTypes = [].concat(req.body.mediaType || []);
  const names = [].concat(req.body.name || []);
  const descriptions = [].concat(req.body.description || []);

  try {
    if (!files || files.length === 0) {
      throw new AppError("Nenhum arquivo enviado");
    }

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      throw new AppError("Agendamento não encontrado");
    }

    // Se já existir arquivos, remove os antigos
    if (schedule.mediaList && schedule.mediaList.length > 0) {
      for (const media of schedule.mediaList) {
        const oldFilePath = path.resolve("public", media.path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    // Processa os novos arquivos
    const mediaList = files.map((file, index) => {
      const description = descriptions[index] || "";
      return {
        path: file.filename,
        name: names[index] || file.originalname,
        type: mediaTypes[index] || file.mimetype,
        description: description
      };
    });

    // Atualiza com os novos arquivos
    schedule.mediaList = mediaList;
    await schedule.save();

    return res.send({ 
      message: "Arquivos anexados com sucesso",
      mediaList: schedule.mediaList
    });
  } catch (err: any) {
    // Se houver erro, tenta remover os arquivos enviados
    if (files) {
      files.forEach(file => {
        if (file.filename) {
          const filePath = path.resolve("public", file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    throw new AppError(err.message);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id, index } = req.params;

  try {
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      throw new AppError("Agendamento não encontrado");
    }

    if (!schedule.mediaList || !schedule.mediaList[index]) {
      throw new AppError("Arquivo não encontrado");
    }

    // Remove o arquivo do sistema de arquivos
    const filePath = path.resolve("public", schedule.mediaList[index].path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove o arquivo da lista
    schedule.mediaList.splice(parseInt(index), 1);
    await schedule.save();

    return res.send({ message: "Arquivo removido com sucesso" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};
