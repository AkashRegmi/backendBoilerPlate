import z from "zod";

export const registerCustomerSchema = {
  body: z.object({
    fullName: z.string("Full name is required").min(2, "Full name is required"),

    email: z.string("Email is required").email("Invalid email address"),

    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),

    contact: z
      .string("Contact number is required")
      .regex(
        /^(98|97)\d{8}$/,
        "Contact number must start with 98 or 97 and be 10 digits",
      ),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email: z.string("Email is required").email("Invalid email address"),
    otp: z
      .string("OTP is required")
      .regex(/^[0-9]{4}$/, "OTP must be a 4-digit number"),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string("Email is required").email("Invalid email address"),
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters"),
  }),
};
export const forgotPasswordSchema = {
  body: z.object({
    email: z.string("Email is required").email("Invalid email address"),
  }),
};
export const changePasswordSchema = {
  body: z.object({
    oldPassword: z
      .string("Old Password is required")
      .min(8, "Old Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "Old Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    newPassword: z
      .string("New Password is required")
      .min(8, "New Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "New Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
  }),
};
export const updateProfileSchema = {
  body: z.object({
    fullName: z
      .string("Full name is required")
      .min(3, "Full name must be at least 3 characters")
      .optional(),
    contact: z
      .string("Contact number is required")
      .regex(
        /^(98|97)\d{8}$/,
        "Contact number must start with 98 or 97 and be 10 digits",
      )
      .optional(),
  }),
};
export const resendOtpSchema = {
  body: z.object({
    email: z.string("Email is required").email("Invalid email address"),
  }),
};
export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string("Refresh token is required"),
  }),
};
export const updateEmailSchema = {
  body: z.object({
    email: z.string("Email is required").email("Invalid email address"),
  }),
};

export type RegisterCustomerDTO = z.infer<typeof registerCustomerSchema.body>;
export type LoginDTO = z.infer<typeof loginSchema.body>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema.body>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema.body>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema.body>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema.body>;
export type ResendOtpDTO = z.infer<typeof resendOtpSchema.body>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema.body>;
export type UpdateEmailDTO = z.infer<typeof updateEmailSchema.body>;
