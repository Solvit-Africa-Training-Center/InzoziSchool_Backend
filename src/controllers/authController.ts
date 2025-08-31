import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ResponseService } from '../utils/response';
import jwt from 'jsonwebtoken';

export class AuthController {

  // Email/Password Login

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginWithEmail({ email, password });

      if (!result) {
        ResponseService({
          res,
          success: false,
          message: 'Invalid credentials',
          data: null,
          status: 401,
        });
        return;
      }

      ResponseService({
        res,
        success: true,
        message: 'Login successful',
        data: { user: result.user, token: result.token },
        status: 200,
      });
    } catch (error) {
      return ResponseService({
        res,
        success: false,
        message: (error as Error).message,
        data: null,
        status: 500,
      });
    }
  }


  // Email/Password Registration

  static async register(req: Request, res: Response) {
    try {
      const { fullName, email, password } = req.body; // no role info

      const result = await AuthService.registerWithEmail({ fullName, email, password });

      if (!result) {
        ResponseService({ res, success: false, message: 'Email already in use', data: null, status: 400 });
        return;
      }

      ResponseService({
        res,
        success: true,
        message: 'Registration successful',
        data: { user: result.user },
        status: 201,
      });
    } catch (error) {
      return ResponseService({
        res,
        success: false,
        message: (error as Error).message,
        data: null,
        status: 500,
      });
    }
  }


  // Google OAuth callback

  static async googleCallback(req: Request, res: Response) {
    try {
      // Passport attaches user to req.user
      const user = req.user;
      if (!user) {
        ResponseService({
          res,
          success: false,
          message: 'Google authentication failed',
          data: null,
          status: 401,
        });
        return;
      }

      // Generate JWT here
      const { token } = await AuthService.generateJwtForUser(user);

      ResponseService({
        res,
        success: true,
        message: 'Login via Google successful',
        data: { user, token },
        status: 200,
      });
    } catch (error) {
      ResponseService({
        res,
        success: false,
        message: (error as Error).message,
        data: null,
        status: 500,
      });
      return;
    }
  }


  // Logout controller

static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      ResponseService({
        res,
        success: false,
        message: 'Authorization header missing',
        data: null,
        status: 401,
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      ResponseService({
        res,
        success: false,
        message: 'Token is missing',
        data: null,
        status: 401,
      });
      return;
    }

    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (!decoded?.exp) {
        ResponseService({
          res,
          success: false,
          message: 'Invalid token',
          data: null,
          status: 400,
        });
        return;
      }

      const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
      await AuthService.logout(token, expiresInSeconds);

      ResponseService({
        res,
        success: true,
        message: 'Logout successful',
        data: null,
        status: 200,
      });
    } catch (error: unknown) {
      ResponseService({
        res,
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
        data: null,
        status: 500,
      });
    }
  }

}
