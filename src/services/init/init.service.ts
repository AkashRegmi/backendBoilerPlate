import { UserRepository } from "../../repositories/user/user.repositories";
import { STATUS_CODE } from "../../utils/constant";
import { AppError } from "../../utils/error";

const getInitData = async (data: any) => {
  const { id, role } = data;
  const user = await UserRepository.findUserById(id);
  if (!user) {
    throw new AppError("User not found", STATUS_CODE.NOT_FOUND);
  }
  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.fullName,
      accountStatus: user.accountStatus,
      isVerified: user.isVerifed,
      contact: user.contact,
      profilePicture: user.profilePicture,
    },
    message: " Init Data fetched successfully",
  };
};
export const initService = { getInitData };
