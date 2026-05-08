import { Document } from "mongoose";
import { UserRole } from "../../enums/user/user.enum";

export interface IStaffManagement extends Document {
  name: string;
  email: string;
  role: UserRole;
  contact: string;
  createdAt?: Date;
  updatedAt?: Date;
}
