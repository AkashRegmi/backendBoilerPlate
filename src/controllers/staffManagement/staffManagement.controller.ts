import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  registerStaffDTO,
  updateStaffDTO,
} from "../../dto/staffManagement/staffManagement.dto";
import { staffManagementSchema } from "../../schemas/staffManagement/staffManagement.schemas";
import { StaffManagementServices } from "../../services/staffManagement/staffManagement.services";
import { sendResponse } from "../../utils/response";
import mongoose from "mongoose";

const registerStaffController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const data: registerStaffDTO = req.body;
      const userId = (req as any).user.id;
      const staff = await StaffManagementServices.registerStaffService(
        data,
        userId,
        session,
      );
      await session.commitTransaction();
      session.endSession();
      sendResponse({
        res,
        statusCode: 200,
        message: staff.message,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },
);
const getAllStaffControllerwithPagination = asyncHandler(
  async (req: Request, res: Response) => {
    const result =
      await StaffManagementServices.getAllStaffWithPaginationService(req.query);
    sendResponse({
      res,
      statusCode: 200,
      message: result.message,
      data: result.result,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  },
);
const getStaffByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await StaffManagementServices.getStaffByIdService(
      id as string,
    );
    sendResponse({
      res,
      statusCode: 200,
      message: result.message,
      data: result.staff,
    });
  },
);
const deleteStaffController = asyncHandler(
  async (req: Request, res: Response) => {
    const role = (req as any).user.role;
    const { id } = req.params;
    const result = await StaffManagementServices.deleteStaffService(
      role,
      id as string,
    );
    sendResponse({
      res,
      statusCode: 200,
      message: result.message,
    });
  },
);
const updateStaffController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = (req as any).user.role;
    const data: updateStaffDTO = req.body;
    const result = await StaffManagementServices.updateStaffService(
      id as string,
      data,
    );
    sendResponse({
      res,
      statusCode: 200,
      message: result.message,
    });
  },
);
const exportStaffExcelController = asyncHandler(
  async (req: Request, res: Response) => {
    const workbook = await StaffManagementServices.generateStaffExcelService(
      req.query,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=staff_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  },
);
export const staffManagementController = {
  registerStaffController,
  getAllStaffControllerwithPagination,
  getStaffByIdController,
  deleteStaffController,
  updateStaffController,
  exportStaffExcelController,
};
