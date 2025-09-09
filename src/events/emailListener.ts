// src/events/emailListener.ts
import { emailEmitter } from "./emailEvent";
import { sendEmail } from "../utils/mailer";

emailEmitter.on("sendResetCode", async (email: string, code: string) => {
  try {
    await sendEmail(
      email,
      "Password Reset Request",
      "resetPassword",
      { resetCode: code }
    );
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error("Error sending reset email:", err);
  }
});

emailEmitter.on("schoolApproved", async (manager: { email: string; firstName: string }, school: { schoolName: string; approvedAt: Date }) => {
  try {
    await sendEmail(
      manager.email,
      "Your school has been approved!",
      "schoolApproval", // schoolApproval.ejs
      {
        managerName: manager.firstName,
        schoolName: school.schoolName,
        approvedAt: school.approvedAt,
      }
    );
    console.log(`School approval email sent to ${manager.email}`);
  } catch (err) {
    console.error("Error sending school approval email:", err);
  }
});
emailEmitter.on(
  "schoolRejected",
  async (
    manager: { email: string; firstName: string },
    school: { schoolName: string; approvedAt: Date },
    reason: string
  ) => {
    try {
      await sendEmail(
        manager.email,
        "Your school registration has been rejected",
        "schoolRejection", // schoolRejection.ejs
        {
          managerName: manager.firstName,
          schoolName: school.schoolName,
          rejectedAt: school.approvedAt,
          reason,
        }
      );
      console.log(`School rejection email sent to ${manager.email}`);
    } catch (err) {
      console.error("Error sending school rejection email:", err);
    }
  }
);


