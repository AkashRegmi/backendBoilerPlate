import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env" });
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z
    .string("PORT is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), { message: "PORT must be a number" })
    .default(5000),
  MONGO_URI: z.string("MONGO_URI is required").min(1),
  SMTP_HOST: z.string("SMTP_HOST is required").min(1),
  SMTP_PORT: z
    .string("SMTP_PORT is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), { message: "SMTP_PORT must be a number" })
    .default(465),
  SMTP_USER: z.string("SMTP_USER is required").min(1),
  SMTP_PASS: z.string("SMTP_PASS is required").min(1),
  JWT_ACCESS_SECRET: z.string("JWT_ACCESS_SECRET is required").min(1),
  JWT_REFRESH_SECRET: z.string("JWT_REFRESH_SECRET is required").min(1),
  JWT_ACCESS_EXPIRES: z.string("JWT_ACCESS_EXPIRES is required").default("15m"),
  JWT_REFRESH_EXPIRES: z
    .string("JWT_REFRESH_EXPIRES is required")
    .default("7d"),
  DEVELOPMENT_URI: z.string("DEVELOPMENT_URI is required").min(1),
  PRODUCTION_URI: z.string("PRODUCTION_URI is required").min(1),
  // SUPER_ADMIN_FULLNAME: z.string("SUPER_ADMIN_FULLNAME is required").min(1),
  SUPERADMIN_EMAIL: z.string("SUPER_ADMIN_EMAIL is required").min(1),
  SUPERADMIN_PASSWORD: z.string("SUPER_ADMIN_PASSWORD is required").min(1),
  // SUPER_ADMIN_CONTACT: z.string("SUPER_ADMIN_CONTACT is required").min(1),
  // ADMIN_FULLNAME: z.string("ADMIN_FULLNAME is required").min(1),
  ADMIN_EMAIL: z.string("ADMIN_EMAIL is required").min(1),
  ADMIN_PASSWORD: z.string("ADMIN_PASSWORD is required").min(1),
  // ADMIN_CONTACT: z.string("ADMIN_CONTACT is required").min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
