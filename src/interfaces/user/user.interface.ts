import { Document } from 'mongoose'
import { ACCOUNT_STATUS } from '../../enums/auth/auth.enum'
import { UserRole } from '../../enums/user/user.enum'
export type UniqueUserField = 'email' | 'contact'
export interface IUser {
  fullName: string
  email: string
  tempEmail?: string
  password: string
  role: UserRole
  contact: string
  address: string
  profilePicture?: string
  isVerifed: boolean
  accountStatus: ACCOUNT_STATUS
  otp?: string
  otpExpiry?: Date
  lastLogin?: Date
  createdBy?: string
}
export interface UserUniquenessResult {
  exists: boolean
  fields: UniqueUserField[]
}

export interface IUserDocument extends IUser, Document {
  generateOTP(): Promise<string>
  verifyOTP(otp: string): Promise<boolean>
  comparePassword(candidatePassword: string): Promise<boolean>
  clearOtp(): void
}
