import mongoose from "mongoose";
import {
  registerStaffDTO,
  updateStaffDTO,
} from "../../dto/staffManagement/staffManagement.dto";
import { ACCOUNT_STATUS } from "../../enums/auth/auth.enum";
import { NOTIFICATION_EVENT } from "../../enums/notification/notification.enum";
import { UserRole } from "../../enums/user/user.enum";
import { UserRepository } from "../../repositories/user/user.repositories";
import { STATUS_CODE } from "../../utils/constant";
import { AppError } from "../../utils/error";
import { generatePassword, validateId } from "../../utils/helper";
import { emailService } from "../email/email.service";
import { NotificationService } from "../notification/notification.service";
import { StaffManagementRepository } from "../../repositories/staffManagement/staffManagement.repository";
import { deleteFileByName } from "../../utils/fileCleanup";
import { User } from "../../models/user/user.model";
import ExcelJS from "exceljs";

const registerStaffService = async (
  data: registerStaffDTO,
  userId?: string,
  session?: mongoose.ClientSession,
): Promise<{ message: string }> => {
  if (data.role !== UserRole.SUPER_ADMIN) {
    throw new AppError(
      "You can not register another super admin",
      STATUS_CODE.BAD_REQUEST,
    );
  }
  const existingUser = await UserRepository.findUserByEmailAndContact(
    data.email,
    data.contact,
  );
  if (existingUser) {
    if (
      existingUser.email === data.email &&
      existingUser.contact === data.contact
    ) {
      throw new AppError(
        "User already exists with the same email and contact",
        STATUS_CODE.BAD_REQUEST,
      );
    }
    if (existingUser.email === data.email) {
      throw new AppError(
        "Email already exists. Please use another email",
        STATUS_CODE.BAD_REQUEST,
      );
    }
    if (existingUser.contact === data.contact) {
      throw new AppError(
        "Contact already exists. Please use another contact",
        STATUS_CODE.BAD_REQUEST,
      );
    }
  }
  const password = generatePassword(8);
  const staff = await UserRepository.createUser(
    {
      ...data,
      password,
      role: data.role,
      isVerifed: true,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      createdBy: userId,
    } as any,
    session,
  );
  if (!staff) {
    throw new AppError(
      "Failed to register staff.Please try again later",
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    );
  }
  //send the email for the account Creation
  await emailService.sendEmail({
    to: staff.email,
    subject: "Account Created Successfully",
    template: "welcome",
    context: {
      staffName: staff.fullName,
      email: staff.email,
      password: password,
    },
  });
  const rolesToNotify: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
  await Promise.all(
    rolesToNotify.map((role) =>
      NotificationService.sendToRole(role, {
        eventName: NOTIFICATION_EVENT.STAFF_CREATED,
        message: `New staff added: ${staff.fullName} with email ${staff.email} and contact ${staff.contact}.`,
        sourceId: staff._id.toString(),
      }),
    ),
  );

  return { message: "Staff registered successfully" };
};
const getAllStaffWithPaginationService = async (query: any) => {
  let {
    page = 1,
    limit = 10,
    role,
    accountStatus,
    search,
    startDate,
    endDate,
  } = query;
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const filter: any = {};
  if (role) filter.role = Number(role);
  if (accountStatus) filter.accountStatus = Number(accountStatus);
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contact: { $regex: search, $options: "i" } },
    ];
  }
  let start: Date | undefined;
  let end: Date | undefined;

  // Date handling
  if (startDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // start of day
  }
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // end of day
  }
  // Validation: end cannot be earlier than start
  if (start && end && end < start) {
    throw new AppError("End date cannot be earlier than start date", 400);
  }
  // Apply filter
  if (start && end) {
    filter.createdAt = { $gte: start, $lte: end };
  } else if (start) {
    filter.createdAt = { $gte: start };
  } else if (end) {
    filter.createdAt = { $lte: end };
  }
  const { result, total } =
    await StaffManagementRepository.getAllStaffWithPaginationRepository(
      filter,
      page,
      limit,
    );
  return {
    result,
    total,
    page: Number(page),
    limit: Number(limit),
    message: "Staffs fetched successfully",
  };
};
const getStaffByIdService = async (id: string) => {
  validateId(id, "Staff Id");
  const staff = await StaffManagementRepository.getStaffByIdRepository(id);
  if (!staff) {
    throw new AppError("Staff not found", STATUS_CODE.NOT_FOUND);
  }
  return {
    staff,
    message: "Staff fetched successfully",
  };
};
const deleteStaffService = async (role: UserRole, id: string) => {
  validateId(id, "Staff Id");
  const staff = await StaffManagementRepository.getStaffByIdRepository(id);
  if (!staff) {
    throw new AppError("Staff not found", STATUS_CODE.NOT_FOUND);
  }
  if (staff.role === UserRole.SUPER_ADMIN) {
    throw new AppError(
      "Super Admin cannot be deleted ",
      STATUS_CODE.BAD_REQUEST,
    );
  }
  if (role === UserRole.ADMIN && staff.role === UserRole.ADMIN) {
    throw new AppError(
      "Admin cannot delete another admin",
      STATUS_CODE.BAD_REQUEST,
    );
  }
  if (staff.role === UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new AppError(
      "Only Super Admin can delete Admin",
      STATUS_CODE.BAD_REQUEST,
    );
  }
  const deleteStaff = await StaffManagementRepository.deleteStaffRepository(id);
  if (!deleteStaff) {
    throw new AppError(
      "Failed to delete staff",
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    );
  }
  if (staff.profilePicture) {
    await deleteFileByName(staff.profilePicture, "profilePicture");
  }
  return {
    message: "Staff deleted successfully",
  };
};
const updateStaffService = async (
  id: string,
  data: updateStaffDTO,
  logInRole?: UserRole,
  session?: mongoose.ClientSession,
): Promise<{ message: string }> => {
  validateId(id, "Staff Id");
  const existingStaff =
    await StaffManagementRepository.getStaffByIdRepository(id);
  if (!existingStaff) {
    throw new AppError("Staff not found", STATUS_CODE.NOT_FOUND);
  }
  //preventing the super Admin to update
  if (
    existingStaff.role === UserRole.SUPER_ADMIN &&
    logInRole !== UserRole.SUPER_ADMIN
  ) {
    throw new AppError(
      "You cannot update a SUPER_ADMIN",
      STATUS_CODE.FORBIDDEN,
    );
  }

  if (data.email || data.contact) {
    const duplicateUser = await UserRepository.findUserByEmailAndContact(
      data.email,
      data.contact,
    );

    if (duplicateUser && duplicateUser._id.toString() !== id) {
      if (
        duplicateUser.email === data.email &&
        duplicateUser.contact === data.contact
      ) {
        throw new AppError(
          "User already exists with same email and contact",
          STATUS_CODE.BAD_REQUEST,
        );
      }

      if (duplicateUser.email === data.email) {
        throw new AppError("Email already exists", STATUS_CODE.BAD_REQUEST);
      }

      if (duplicateUser.contact === data.contact) {
        throw new AppError("Contact already exists", STATUS_CODE.BAD_REQUEST);
      }
    }
  }
  if (
    data.role === UserRole.SUPER_ADMIN &&
    logInRole !== UserRole.SUPER_ADMIN
  ) {
    throw new AppError(
      "You cannot assign SUPER_ADMIN role",
      STATUS_CODE.BAD_REQUEST,
    );
  }
  const updatedStaff = await StaffManagementRepository.updateStaffRepository(
    id,
    data,
    session,
  );
  if (!updatedStaff) {
    throw new AppError(
      "Failed to update staff",
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    );
  }
  return {
    message: "Staff updated successfully",
  };
};
const generateStaffExcelService = async (query: any) => {
  const { role, accountStatus, search, startDate, endDate } = query;

  const filter: any = {};

  //  Exclude CUSTOMER only
  filter.role = { $ne: UserRole.CUSTOMER };

  if (role !== undefined) {
    filter.role = {
      $ne: UserRole.CUSTOMER,
      $eq: Number(role),
    };
  }

  if (accountStatus !== undefined) {
    filter.accountStatus = Number(accountStatus);
  }

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { contact: { $regex: search, $options: "i" } },
    ];
  }

  //  Date filter
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (start && end && end < start) {
      throw new AppError("End date cannot be before start date", 400);
    }

    filter.createdAt = {};

    if (start) {
      start.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = start;
    }

    if (end) {
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Fetch staff + populate createdBy
  const staffs = await User.find(filter)
    .select("-password")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
    .lean();

  //  Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Staffs");

  worksheet.columns = [
    { header: "Full Name", key: "fullName", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Contact", key: "contact", width: 20 },
    { header: "Role", key: "role", width: 20 },
    { header: "Status", key: "accountStatus", width: 20 },
    { header: "Created By", key: "createdByName", width: 25 }, // ✅ added
    { header: "Created At", key: "createdAt", width: 25 },
  ];

  //  Bold header
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  staffs.forEach((staff: any) => {
    const createdBy = staff.createdBy as { fullName?: string };

    worksheet.addRow({
      fullName: staff.fullName,
      email: staff.email,
      contact: staff.contact,
      role: UserRole[staff.role] || "N/A",
      accountStatus: ACCOUNT_STATUS[staff.accountStatus],
      createdByName: createdBy?.fullName || "N/A", //
      createdAt: staff.createdAt
        ? new Date(staff.createdAt).toLocaleString()
        : "-",
    });
  });

  return workbook;
};
export const StaffManagementServices = {
  registerStaffService,
  getAllStaffWithPaginationService,
  getStaffByIdService,
  deleteStaffService,
  updateStaffService,
  generateStaffExcelService,
};
