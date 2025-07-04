import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if (req.user.profile !== "admin") {
    throw new AppError(
      "Acesso não permitido",
      401
    );
  }

  return next();
};

export default isAdmin; 