import { Request, Response } from "express";
import versionConfig from "../config/version";

export const index = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
        version: versionConfig.version
    });
};
