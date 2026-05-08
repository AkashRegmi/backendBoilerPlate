import { Document } from 'mongoose';
import { UserRole } from '../../enums/user/user.enum'; // Adjust import based on actual location

export interface IAction {
  type: string;
  required: boolean;
}

export interface IPrivilege {
  module: string;
  actions: IAction[];
}

export interface IPrivilegeManagement extends Document {
  role: UserRole;
  privileges: IPrivilege[];
  createdAt?: Date;
  updatedAt?: Date;
}
