import jwt, { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'
import { env } from '../../configs/env.config'
import { ACCOUNT_STATUS } from '../../enums/auth/auth.enum'
import { UserRepository } from '../../repositories/user/user.repositories'
import {
  ChangePasswordDTO,
  ForgotPasswordDTO,
  LoginDTO,
  RefreshTokenDTO,
  RegisterCustomerDTO,
  UpdateEmailDTO,
  UpdateProfileDTO,
  VerifyOtpDTO,
} from '../../schemas/auth/auth.schemas'
import { IMAGE_BASE_URL, STATUS_CODE } from '../../utils/constant'
import { AppError } from '../../utils/error'
import { deleteFileByName } from '../../utils/fileCleanup'
import { emailService } from '../email/email.service'
import { NotificationService } from '../notification/notification.service'
import { generateToken } from '../token/token.service'
import { INotification } from '../../interfaces/notification/notification.interface'

const registerUser = async (
  data: RegisterCustomerDTO,
): Promise<{ message: string }> => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // 1. Check for existing user with better validation
    const existingUser = await UserRepository.findUserByEmailAndContact(
      data.email,
      data.contact,
      session,
    )

    if (existingUser && existingUser.email === data.email) {
      throw new AppError('Email already exists', STATUS_CODE.BAD_REQUEST)
    }
    if (existingUser && existingUser.contact === data.contact) {
      throw new AppError('Contact already exists', STATUS_CODE.BAD_REQUEST)
    }

    // 2. Handle existing verified user
    if (existingUser?.isVerifed) {
      throw new AppError(
        'User already exists and is verified',
        STATUS_CODE.BAD_REQUEST,
      )
    }

    // 3. Handle existing unverified user (resend OTP)
    if (existingUser && !existingUser.isVerifed) {
      // Validate if OTP resend is allowed (add rate limiting if needed)
      const otp = await existingUser.generateOTP()

      if (!otp) {
        throw new AppError(
          'Failed to generate OTP',
          STATUS_CODE.INTERNAL_SERVER_ERROR,
        )
      }

      await existingUser.save({ session })

      // Send email (fire and forget, but track failures if needed)
      await emailService.sendEmail({
        to: existingUser.email,
        subject: 'Verify your email',
        template: 'otp',
        context: {
          otp: otp,
          name: existingUser.fullName,
        },
      })

      await session.commitTransaction()
      return {
        message: `OTP resent to gmail ${existingUser.email} successfully`,
        // Consider returning userId for tracking
      }
    }

    // 4. Create new user
    const user = await UserRepository.createUser(data, session)

    if (!user) {
      throw new AppError(
        'Failed to create user',
        STATUS_CODE.INTERNAL_SERVER_ERROR,
      )
    }

    const otp = await user.generateOTP()

    if (!otp) {
      throw new AppError(
        'Failed to generate OTP',
        STATUS_CODE.INTERNAL_SERVER_ERROR,
      )
    }

    await user.save({ session })

    await emailService.sendEmail({
      to: user.email,
      subject: 'Verify your email',
      template: 'otp',
      context: {
        otp: otp,
        name: user.fullName,
      },
    })

    await session.commitTransaction()

    return {
      message: `OTP sent to gmail ${user.email} successfully`,
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Registration error:', error)

    // Rollback transaction
    if (session.inTransaction()) {
      await session.abortTransaction()
    }

    // Re-throw the error for the controller to handle
    throw error
  } finally {
    // Ensure session is always ended
    await session.endSession().catch(console.error)
  }
}
const verifyInputOtp = async (data: VerifyOtpDTO, isEmailChange?: boolean) => {
  const user = await UserRepository.findUserByEmail(data.email)
  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND)
  }

  //checking the otp Expiration
  if (
    !user.otp ||
    !user.otpExpiry ||
    user.otpExpiry.getTime() < new Date().getTime()
  ) {
    throw new AppError('OTP is expired or invalid', STATUS_CODE.BAD_REQUEST)
  }
  const isValidOtp = await user.verifyOTP(data.otp)

  if (!isValidOtp) {
    throw new AppError('Invalid OTP', STATUS_CODE.BAD_REQUEST)
  }
  user.clearOtp()
  if (isEmailChange) {
    user.email = user.tempEmail as string
    user.tempEmail = undefined
  }
  const result = await user.save()
  if (!result) {
    throw new AppError(
      'Failed to update user',
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    )
  } else {
    if (!isEmailChange) {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Account Created successfully',
        template: 'verify',
        context: {
          name: user.fullName,
          email: user.email,
        },
      })
    }
    return {
      message: 'User verified successfully',
    }
  }
}

const login = async (data: LoginDTO) => {
  const user = await UserRepository.findUserByEmail(data.email)

  if (!user) {
    throw new AppError('User not found. Please Sign Up', STATUS_CODE.NOT_FOUND)
  }
  const isValidPassword = await user.comparePassword(data.password)

  if (!isValidPassword) {
    throw new AppError('Invalid password', STATUS_CODE.UNAUTHORIZED)
  }
  //checking the account status
  if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    throw new AppError('Account is not active. Please verify your email.', 403)
  }
  const tokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.fullName,
  }
  const { accessToken, refreshToken } = generateToken(tokenPayload)
  return {
    accessToken,
    refreshToken,
  }
}
//thisi dfor the forgot password
const forgotPassword = async (data: ForgotPasswordDTO) => {
  const userExist = await UserRepository.findUserByEmail(data.email)
  if (!userExist) {
    throw new AppError('User not found. Please Sign Up', STATUS_CODE.NOT_FOUND)
  }
  const otp = await userExist.generateOTP()
  await userExist.save()
  await emailService.sendEmail({
    to: userExist.email,
    subject: 'Reset your password',
    template: 'forgot-password',
    context: {
      otp: otp,
      name: userExist.fullName,
      expiryTime: userExist?.otpExpiry,
    },
  })
  return {
    message: `OTP sent to gmail ${userExist.email} successfully`,
  }
}
//This is the for changino the Password
const changePassword = async (
  email: string,
  data: ChangePasswordDTO,
): Promise<void> => {
  const user = await UserRepository.findUserByEmail(email)
  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND)
  }
  const isValidPassword = await user.comparePassword(data.oldPassword)
  if (!isValidPassword) {
    throw new AppError('Invalid password', STATUS_CODE.UNAUTHORIZED)
  }
  if (data.oldPassword === data.newPassword) {
    throw new AppError(
      'New password cannot be same as old password',
      STATUS_CODE.BAD_REQUEST,
    )
  }

  user.password = data.newPassword
  await user.save()
}

const resetUserOtp = async (email: string) => {
  const user = await UserRepository.findUserByEmail(email)
  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND)
  }
  const otp = await user.generateOTP()
  await user.save()
  await emailService.sendEmail({
    to: user.email,
    subject: 'Verify your email',
    template: 'otp',
    context: {
      otp: otp,
      name: user.fullName,
    },
  })
  return {
    message: `OTP sent to gmail ${user.email} successfully`,
  }
}
const updateProfile = async (email: string, data: UpdateProfileDTO) => {
  const userExist = await UserRepository.findUserByEmail(email)
  if (!userExist) {
    throw new AppError('User not found. Please Sign Up', STATUS_CODE.NOT_FOUND)
  }
  if (data.fullName !== undefined) userExist.fullName = data.fullName
  if (data.contact !== undefined) userExist.contact = data.contact
  const result = await userExist.save()
  await NotificationService.sendNotification({
 eventName: 'update_profile',
   recipient: userExist._id,
   recipientRole: userExist.role,
   message: `Your profile has been updated by ${userExist.fullName}`,
   sourceId: userExist._id
  } as INotification)
  if (!result) {
    throw new AppError(
      'Failed to update user',
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    )


  } else {
    return {
      message: 'User updated successfully',
    }
  }
}

const updateProfileImage = async (email: string, file: Express.Multer.File) => {
  const userExist = await UserRepository.findUserByEmail(email)
  if (!userExist) {
    throw new AppError('User not found. Please Sign Up', STATUS_CODE.NOT_FOUND)
  }
  const userOldImage = userExist.profilePicture?.split('/').pop()
  console.log(userOldImage)
  if (userOldImage) {
    await deleteFileByName(userOldImage, 'profilePicture')
  }
  userExist.profilePicture = `${IMAGE_BASE_URL}/images/profilePicture/${file.filename}`
  const result = await userExist.save()
  if (!result) {
    throw new AppError(
      'Failed to update user',
      STATUS_CODE.INTERNAL_SERVER_ERROR,
    )
  } else {
    return {
      message: 'User ProfileImage updated successfully',
    }
  }
}

const refreshUserToken = async (data: RefreshTokenDTO) => {
  if (!data.refreshToken)
    throw new AppError('Refresh token is required', STATUS_CODE.BAD_REQUEST)
  try {
    const decoded = jwt.verify(
      data.refreshToken,
      env.JWT_REFRESH_SECRET,
    ) as JwtPayload
    const { iat, exp, ...payload } = decoded
    const newAccessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET!, {
      expiresIn: env.JWT_ACCESS_EXPIRES || '15m',
    } as jwt.SignOptions)
    const newRefreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET!, {
      expiresIn: env.JWT_REFRESH_EXPIRES || '30d',
    } as jwt.SignOptions)
    return {
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  } catch (error) {
    throw error
  }
}

export const updateUserEmail = async (userId: string, data: UpdateEmailDTO) => {
  const { email } = data

  // 1Check if email already exists
  const existingUser = await UserRepository.findUserByEmail(email)
  if (existingUser) {
    throw new AppError('Email already in use', STATUS_CODE.BAD_REQUEST)
  }

  // Check if user exists
  const user = await UserRepository.findUserById(userId)
  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND)
  }

  // Generate OTP
  const otp = await user.generateOTP()

  // Update DB
  user.tempEmail = email
  await user.save()

  // Send Email
  await emailService.sendEmail({
    to: email,
    subject: 'Verify your email',
    template: 'otp',
    context: {
      otp: otp,
      name: user.fullName,
    },
  })

  return {
    message: 'Email updated. OTP sent to new email.',
  }
}
export const authService = {
  registerUser,
  verifyInputOtp,
  login,
  forgotPassword,
  changePassword,
  resetUserOtp,
  updateProfile,
  updateProfileImage,
  refreshUserToken,
  updateUserEmail,
}
