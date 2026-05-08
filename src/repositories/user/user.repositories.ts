import mongoose from 'mongoose'
import {
  IUserDocument,
  UniqueUserField,
  UserUniquenessResult,
} from '../../interfaces/user/user.interface'
import { RegisterCustomerDTO } from '../../schemas/auth/auth.schemas'
import { STATUS_CODE } from '../../utils/constant'
import { AppError } from '../../utils/error'
import { User } from '../../models/user/user.model'

const findUserByEmail = async (
  email: string,
  session?: mongoose.ClientSession,
): Promise<IUserDocument | null> => {
  return await User.findOne({ email }).session(session || null)
}

const findUserById = async (id: string): Promise<IUserDocument | null> => {
  return await User.findById(id)
}
const findUserByContact = async (
  contact: string,
  session?: mongoose.ClientSession,
): Promise<IUserDocument | null> => {
  return await User.findOne({ contact }).session(session || null)
}
const findUserByEmailAndContact = async (
  email?: string,
  contact?: string,
  session?: mongoose.ClientSession,
): Promise<IUserDocument | null> => {
  return await User.findOne({
    $or: [
      { email, contact }, // Both match
      { email }, // Email matches
      { contact }, // Contact matches
    ],
  }).session(session || null)
}
//Checking the user uniqueness
const checkUserUniqueness = async (
  email?: string,
  contact?: string,
): Promise<UserUniquenessResult> => {
  const fields: UniqueUserField[] = []

  if (!email && !contact) {
    return { exists: false, fields }
  }

  const orConditions = []

  if (email) orConditions.push({ email })
  if (contact) orConditions.push({ contact })

  const user = await User.findOne({
    $or: orConditions,
  }).lean()

  if (!user) {
    return { exists: false, fields }
  }

  if (email && user.email === email) {
    fields.push('email')
  }

  if (contact && user.contact === contact) {
    fields.push('contact')
  }

  return {
    exists: fields.length > 0,
    fields,
  }
}
//here We crate a new user
const createUser = async (
  data: RegisterCustomerDTO,
  session?: mongoose.ClientSession,
): Promise<IUserDocument> => {
  try {
    // IMPORTANT: array syntax for transactions
    const [user] = await User.create([data], { session })

    return user
  } catch (error: any) {
    // Handle duplicate key error
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]

      throw new AppError(`${field} already exists`, STATUS_CODE.BAD_REQUEST)
    }

    throw error
  }
}
export const updateUserEmailWithOtp = async (
  userId: string,
  email: string,
  otp: string,
  otpExpiry: Date,
): Promise<IUserDocument | null> => {
  return User.findByIdAndUpdate(
    userId,
    {
      email,
      otp,
      otpExpiry,
      isVerifed: false,
    },
    { new: true },
  )
}

export const UserRepository = {
  findUserByEmail,
  findUserByContact,
  findUserByEmailAndContact,
  findUserById,
  checkUserUniqueness,
  createUser,
  updateUserEmailWithOtp,
}
