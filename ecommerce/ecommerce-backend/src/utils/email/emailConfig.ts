import * as nodemailer from 'nodemailer';
import { config } from '../config/validate-env';

// Email configuration constants
export const EMAIL_SENDER = config.EMAIL_USER;
export const APP_NAME = config.APP_NAME;

/**
 * Creates and configures a nodemailer transporter using Gmail SMTP.
 */
export const createTransporter = (): nodemailer.Transporter => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
  });
};
