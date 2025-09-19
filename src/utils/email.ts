import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string }[];
}

export const sendEmail = async ({ to, subject, html, attachments }: EmailPayload) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments,
  });

  console.log('📨 Email sent:', info.messageId);
};
