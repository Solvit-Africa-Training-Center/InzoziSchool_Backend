import { Request, Response } from "express";
import { AuthService,PasswordResetService} from "../services/AuthService";
import { ResponseService } from "../utils/response";
import { IRequestUser } from "../middlewares/authMiddleware";
import { LoginUserRequest } from "../types/userInterface";
import { sendEmail } from "../utils/mailer";

const authService = new AuthService();

export class AuthController {
  // Login
  static async login(req: LoginUserRequest, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return ResponseService({ data: null, status: 400, success: false, message: "Email and password are required", res });
    }

    const response = await authService.login({ email, password });
    return ResponseService
    ({ ...response, res });
  }

  // Logout
  static async logout(req: IRequestUser, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];
    const response = await authService.logout(token);
    return ResponseService({ ...response, res });
  }
}



export class PasswordResetController {
   static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return ResponseService({ data: null, success: false, status: 400, message: "Email required", res });

    try {
      await PasswordResetService.requestReset(email);
      return ResponseService({ data: null, success: true, status: 200, message: "Reset code sent", res });
    } catch (e: any) {
      return ResponseService({ data: null, success: false, status: 400, message: e.message, res });
    }
  }
  static async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return ResponseService({ data: null, success: false, status: 400, message: "Email, code and password required", res });
    }

    try {
      await PasswordResetService.resetPassword(email, code, newPassword);
      
      return ResponseService({ data:null, success: true, status: 200, message: "Password updated Successful", res });
    } catch (e: any) {
      return ResponseService({ data: null, success: false, status: 400, message: e.message, res });
    }
  }
}
