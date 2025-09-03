import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/helper';
import { ResponseService } from '../utils/response';

// Import JWTPayload from helper to avoid duplicate definition
interface JWTPayload {
    id: string;
    email: string;
    role: string;
    jti: string;
    iat?: number;
    exp?: number;
}

interface AuthRequest extends Request {
    user?: JWTPayload;
}


export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return ResponseService({
                res,
                status: 401,
                success: false,
                message: 'Authorization header missing',
                data: null,
            });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return ResponseService({
                res,
                status: 401,
                success: false,
                message: 'Token missing',
                data: null,
            });
        }

        // Verify token and check blacklist
        const decoded = await verifyToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        return ResponseService({
            res,
            status: 401,
            success: false,
            message: 'Unauthorized',
            data: null,
        });
    }
};

// Middleware for role-based access control (optional, reusable)
export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return ResponseService({
                    res,
                    status: 403,
                    success: false,
                    message: 'Access denied',
                    data: null,
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return ResponseService({
                    res,
                    status: 403,
                    success: false,
                    message: 'You do not have permission to access this resource',
                    data: null,
                });
            }

            next();
        } catch (error) {
            return ResponseService({
                res,
                status: 500,
                success: false,
                message: 'Server error',
                data: null,
            });
        }
    };
};
