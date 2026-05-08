import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { initService } from "../../services/init/init.service";
import { send } from "node:process";
import { sendResponse } from "../../utils/response";
import { STATUS_CODE } from "../../utils/constant";
const initController = asyncHandler(async (req: Request, res: Response) => {
  const { id, role } = (req as any).user;
  const data = await initService.getInitData({ id, role });
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: data.message,
    data: data.user,
  });
});

export const InitController = { initController };
