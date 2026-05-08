import nodemailer from 'nodemailer';
import { env } from './env.config';

export const emailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await emailTransporter.verify();
    console.log('Email service connected successfully');
  } catch (error) {
    console.error('Email service connection failed');

    if (env.NODE_ENV === 'production') {
      // don’t crash prod, just log
      console.error(error);
    } else {
      // fail fast in dev
      throw error;
    }
  }
};
