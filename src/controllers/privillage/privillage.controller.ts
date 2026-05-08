import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PrivilegeService } from "../../services/privilege/privilege.service";
import { sendResponse } from "../../utils/response";
import { STATUS_CODE } from "../../utils/constant";

export const getPrivilegeByRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { role } = req.params;
    const privileges = await PrivilegeService.getPrivileges(Number(role));
    sendResponse({
      res,
      statusCode: STATUS_CODE.OK,
      message: "Privileges fetched successfully",
      data: privileges,
    });
  },
);
export const updatePrivilege = asyncHandler(
  async (req: Request, res: Response) => {
    const { role } = req.params;
    const { privileges } = req.body;
    const updatedPrivilege = await PrivilegeService.upsertPrivileges(
      Number(role),
      privileges,
    );
    sendResponse({
      res,
      statusCode: STATUS_CODE.OK,
      message: "Privileges updated successfully",
      data: updatedPrivilege,
    });
  },
);
export const getAllSystemPrivileges = asyncHandler(
  async (req: Request, res: Response) => {
    const privileges = PrivilegeService.getAllSystemPrivileges();
    sendResponse({
      res,
      statusCode: STATUS_CODE.OK,
      message: "System privileges fetched successfully",
      data: privileges,
    });
  },
);
export const deletePrivilege = asyncHandler(
  async (req: Request, res: Response) => {
    const { role } = req.params;
    const deletedPrivilege = await PrivilegeService.deletePrivileges(
      Number(role),
    );
    sendResponse({
      res,
      statusCode: STATUS_CODE.OK,
      message: "Privileges deleted successfully",
      data: deletedPrivilege,
    });
  },
);
