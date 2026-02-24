import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

const createTransporter = () => {
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP_USER and SMTP_PASS must be configured');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

export const sendResetOtpEmail = async (toEmail: string, otp: string): Promise<void> => {
  const transporter = createTransporter();

  const subject = 'Your Password Reset OTP';
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="margin: 0 0 12px; color: #111827;">Password Reset</h2>
      <p style="margin: 0 0 16px; color: #374151;">Use the following One-Time Password (OTP) to reset your password. This OTP is valid for <strong>10 minutes</strong>.</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #111827; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center;">
        ${otp}
      </div>
      <p style="margin: 16px 0 0; color: #6b7280; font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: toEmail,
    subject,
    html,
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
  });
};
