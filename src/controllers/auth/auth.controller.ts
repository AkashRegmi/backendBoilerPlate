import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { ChangePasswordDTO, ForgotPasswordDTO, LoginDTO, RefreshTokenDTO, RegisterCustomerDTO, UpdateEmailDTO, UpdateProfileDTO, VerifyOtpDTO } from '../../schemas/auth/auth.schemas'
import { authService } from '../../services/auth/authServices'
import { STATUS_CODE } from '../../utils/constant'
import { sendResponse } from '../../utils/response'
import { AppError } from '../../utils/error'


const register = asyncHandler(async (req: Request, res: Response) => {
  const data: RegisterCustomerDTO = req.body

  const user = await authService.registerUser(data)
  sendResponse({
    res,
    statusCode: STATUS_CODE.CREATED,
    message: user.message,
  })
})
const verifyUserOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const data: VerifyOtpDTO = req.body
    const user = await authService.verifyInputOtp(data)
    sendResponse({
      res,
      statusCode: STATUS_CODE.OK,
      message: user.message,
    })
  },
)
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const data: ForgotPasswordDTO = req.body
  const user = await authService.forgotPassword(data)
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: user.message,
  })
})

const login = asyncHandler(async (req: Request, res: Response) => {
  const data: LoginDTO = req.body

  const user = await authService.login(data)

  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: 'Login successful',
    data: {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    },
  })
})
//thisis for changing the password
const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const data: ChangePasswordDTO = req.body
  const user = (req as any).user.email
  console.log(user)

  await authService.changePassword(user, data)
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: 'Password changed successfully',
  })
})
//this is for thr reset of otp
const resetUserOtp = asyncHandler(async (req: Request, res: Response) => {
  const user = req.body.email
  const otp = await authService.resetUserOtp(user)
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: otp.message,
  })
})
//this is for updating the profile
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user.email
  const data: UpdateProfileDTO = req.body
  const result = await authService.updateProfile(user, data)
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: result.message,
  })
})

const updateProfileImage = async (req: Request, res: Response) => {
  const email = req.user?.email
  const file = req.file
  if (!file) {
    throw new AppError('File not found', STATUS_CODE.BAD_REQUEST)
  }
  const result = await authService.updateProfileImage(email as string, file)
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: result.message,
  })
}
const refreshtoken = asyncHandler(async (req: Request, res: Response) => {
  const data: RefreshTokenDTO = req.body
  const token = await authService.refreshUserToken(data)
  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: token.message,
    data: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    },
  })
})

const updateUserEmail = asyncHandler(async (req: Request, res: Response) => {
  const data: UpdateEmailDTO = req.body
  const userId = req.user?.id

  const result = await authService.updateUserEmail(userId as string, data)

  sendResponse({
    res,
    statusCode: STATUS_CODE.OK,
    message: result.message,
  })
})

export const AuthController = {
  register,
  resetUserOtp,
  verifyUserOtpController,
  login,
  forgotPassword,
  changePassword,
  updateProfile,
  updateProfileImage,
  refreshtoken,
  updateUserEmail,
}
