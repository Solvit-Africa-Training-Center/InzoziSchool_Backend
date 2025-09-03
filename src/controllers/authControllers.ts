import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ResponseService } from '../utils/response';

export class AuthController {
    // REGISTER
    static async register(req: Request, res: Response) {
        try {
            return await AuthService.registerWithEmail(req.body, res);
        } catch (error) {
            const { message, stack } = error as Error;
            return ResponseService({
                res,
                status: 500,
                success: false,
                message: 'Internal server error',
                data: { message, stack },
            });
        }
    }

    // LOGIN
    static async login(req: Request, res: Response) {
        try {
            return await AuthService.login(req.body, res);
        } catch (error) {
            const { message, stack } = error as Error;
            return ResponseService({
                res,
                status: 500,
                success: false,
                message: 'Login failed',
                data: { message, stack },
            });
        }
    }

    // LOGOUT
    static async logout(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return ResponseService({
                    res,
                    status: 400,
                    success: false,
                    message: 'Authorization token missing or malformed',
                    data: null,
                });
            }

            const token = authHeader.split(' ')[1];
            return await AuthService.logout(token, res);
        } catch (error) {
            const { message, stack } = error as Error;
            return ResponseService({
                res,
                status: 500,
                success: false,
                message: 'Logout failed',
                data: { message, stack },
            });
        }
    }

    // FORGOT PASSWORD
    static async forgotPassword(req: Request, res: Response) {
        try {
            return await AuthService.forgotPassword(req.body, res);
        } catch (error) {
            const { message, stack } = error as Error;
            return ResponseService({
                res,
                status: 500,
                success: false,
                message: 'Failed to send password reset link',
                data: { message, stack },
            });
        }
    }

    // RESET PASSWORD
    static async resetPassword(req: Request, res: Response) {
        try {
            return await AuthService.resetPassword(req.body, res);
        } catch (error) {
            const { message, stack } = error as Error;
            return ResponseService({
                res,
                status: 500,
                success: false,
                message: 'Password reset failed',
                data: { message, stack },
            });
        }
    }
}
