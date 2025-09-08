import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { config } from "dotenv";
config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});


export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  templateVars: Record<string, any>
) => {
  const templatePath = path.join(__dirname, "../templates", `${templateName}.ejs`);
  const html = await ejs.renderFile(templatePath, templateVars);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
};
