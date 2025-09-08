// src/events/emailListener.ts
import { emailEmitter } from "./emailEvent";
import { sendEmail } from "../utils/mailer";

emailEmitter.on("sendResetCode", async (email: string, code: string) => {
  try {
    await sendEmail(
      email,
      "Password Reset Request",
      "resetPassword", // resetPassword.ejs
      { resetCode: code }
    );
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error("Error sending reset email:", err);
  }
});
