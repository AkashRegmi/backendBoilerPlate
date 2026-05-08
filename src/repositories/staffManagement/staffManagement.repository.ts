import mongoose from "mongoose";
import { UserRole } from "../../enums/user/user.enum";
import { IUser } from "../../interfaces/user/user.interface";
import { User } from "../../models/user/user.model";

const getAllStaffWithPaginationRepository = async (
  filter: any = {},
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;
  const finalFilter = {
    ...filter,
    role: {
      $nin: [UserRole.CUSTOMER, UserRole.SUPER_ADMIN], // Exclude both customers and super admins
    },
  };
  const [result, total] = await Promise.all([
    User.find(finalFilter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({ path: "createdBy", select: "fullName" })
      .lean(),
    User.countDocuments(finalFilter),
  ]);
  return { result, total };
};
const getStaffByIdRepository = async (id: string) => {
  //  Find staff by ID
  const staff = await User.findById(id)
    .select("-password") // exclude password
    .populate({ path: "createdBy", select: "fullName" })
    .lean(); // optional populate

  return staff;
};
const getStaffByConditionRepository = (condition: Record<string, any>) => {
  return User.find(condition)
    .select("-password") // exclude password
    .populate({ path: "createdBy", select: "fullName" }); // optional populate
};
const deleteStaffRepository = async (id: string) => {
  const staff = await User.findByIdAndDelete(id);
  return staff;
};
const updateStaffRepository = async (
  id: string,
  data: Partial<IUser>,
  session?: mongoose.ClientSession,
) => {
  return await User.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
      session,
    },
  );
};
export const StaffManagementRepository = {
  getAllStaffWithPaginationRepository,
  getStaffByIdRepository,
  getStaffByConditionRepository,
  deleteStaffRepository,
  updateStaffRepository,
};
