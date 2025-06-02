import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import path from "path";
import fs from "fs";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import bodyParser from 'body-parser';

// Inicializa a pasta public
const initializePublicFolder = () => {
  const publicFolder = uploadConfig.directory;
  logger.info(`Verificando pasta public em: ${publicFolder}`);
  
  if (!fs.existsSync(publicFolder)) {
    try {
      logger.info("Pasta public não encontrada. Tentando criar...");
      fs.mkdirSync(publicFolder, { recursive: true });
      fs.chmodSync(publicFolder, 0o775);
      logger.info("Pasta public criada com sucesso");
    } catch (err) {
      logger.error(`Erro ao criar pasta public: ${err}`);
      throw new Error("Erro ao criar pasta de upload");
    }
  } else {
    logger.info("Pasta public já existe");
  }
};

// Inicializa a pasta public antes de iniciar o servidor
initializePublicFolder();
Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

const bodyparser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
