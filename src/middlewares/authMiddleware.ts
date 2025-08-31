import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../database/models/Users';
import { ResponseService } from '../utils/response';
import { redis } from '../utils/redis'; // import redis client

interface JwtPayloadMinimal {
  id: string;
  email: string;
  role: string;
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      data: null,
      message: 'Authorization token missing',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return ResponseService({
      res,
      status: 401,
      success: false,
      data: null,
      message: 'Token not provided',
    });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted === 'true') {
      return ResponseService({
        res,
        status: 403,
        success: false,
        data: null,
        message: 'Token has been logged out',
      });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return ResponseService({
        res,
        status: 500,
        success: false,
        data: null,
        message: 'JWT secret is not configured',
      });
    }

    const decoded = jwt.verify(token, secret) as JwtPayloadMinimal;

    if (!decoded.id || !decoded.email || !decoded.role) {
      return ResponseService({
        res,
        status: 403,
        success: false,
        data: null,
        message: 'Invalid token payload',
      });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return ResponseService({
        res,
        status: 404,
        success: false,
        data: null,
        message: 'User not found',
      });
    }

    req.user = user;
    return next();
  } catch {
    return ResponseService({
      res,
      status: 403,
      success: false,
      data: null,
      message: 'Invalid or expired token',
    });
  }

};
