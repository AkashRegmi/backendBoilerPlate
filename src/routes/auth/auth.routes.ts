import { Router } from 'express'
import { validateRequest } from '../../middlewares/validate/validateRequest.middleware'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerCustomerSchema,
  resendOtpSchema,
  updateEmailSchema,
  updateProfileSchema,
  verifyOtpSchema,
} from '../../schemas/auth/auth.schemas'
import { AuthController } from '../../controllers/auth/auth.controller'
import { authenticate } from '../../middlewares/auth/auth.middleware'
import { uploadErrorHandler, uploadSingle } from '../../middlewares/upload/upload.middleware'

const router = Router()

router.post(
  '/auth/register',
  validateRequest(registerCustomerSchema),
  AuthController.register,
)
router.post('/auth/login', validateRequest(loginSchema), AuthController.login)
router.post(
  '/auth/forgot-password',
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
)
router.post(
  '/auth/changePassword',
  authenticate,
  validateRequest(changePasswordSchema),
  AuthController.changePassword,
)
router.post(
  '/auth/resend-otp',
  validateRequest(resendOtpSchema),
  AuthController.resetUserOtp,
)
router.post(
  '/auth/verify-otp',
  validateRequest(verifyOtpSchema),
  AuthController.verifyUserOtpController,
)
router.put(
  '/auth/update-profile',
  authenticate,
  validateRequest(updateProfileSchema),
  AuthController.updateProfile,
)
router.put(
  '/auth/update-email',
  authenticate,
  validateRequest(updateEmailSchema),
  AuthController.updateUserEmail,
)
router.put(
  '/auth/update-profile-image',
  uploadSingle('profilePicture'),
  uploadErrorHandler,
  authenticate,
  AuthController.updateProfileImage,
)
router.post(
  '/auth/refresh-token',
  validateRequest(refreshTokenSchema),
  AuthController.refreshtoken,
)

export default router
