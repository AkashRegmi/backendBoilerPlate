import z from "zod";
import { UserRole } from "../../enums/user/user.enum";
export const staffManagementSchema = {
  body: z.object({
    fullName: z
      .string("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters")
      .regex(/^[A-Za-z ]+$/, "Name must contain only letters and spaces")
      .trim(),
    email: z.string("Email is required").email("Invalid email address"),
    contact: z
      .string("Contact number is required")
      //make for the Nepal
      .regex(
        /^9\d{9}$/,
        "Nepali mobile number must start with 9 and be exactly 10 digits",
      )
      .trim(),
    role: z
      .number("Role is required")
      .refine((val) => Object.values(UserRole).includes(val), {
        message: "Please select a valid role",
      }),
  }),
};
export const updateStaffManagementSchema = {
  body: z.object({
    fullName: z
      .string("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters")
      .regex(/^[A-Za-z ]+$/, "Name must contain only letters and spaces")
      .trim()
      .optional(),
    email: z
      .string("Email is required")
      .email("Invalid email address")
      .optional(),
    contact: z
      .string("Contact number is required")
      .regex(
        /^9\d{9}$/,
        "Nepali mobile number must start with 9 and be exactly 10 digits",
      )
      .trim()
      .optional(),
    role: z
      .number("Role is required")
      .refine((val) => Object.values(UserRole).includes(val), {
        message: "Please select a valid role",
      })
      .optional(),
  }),
};
