import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../src/middlewares/authMiddleware';
import { verifyToken } from '../../src/utils/helper';
import { TestSetup } from '../helpers/testSetup';

// Mock the helper functions
jest.mock('../../src/utils/helper');
const mockedVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    jti: string;
    iat?: number;
    exp?: number;
  };
}

describe('Auth Middleware', () => {
  beforeAll(async () => {
    await TestSetup.beforeAll();
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and call next()', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'SCHOOL_MANAGER',
        jti: 'jwt-123',
        iat: 1234567890,
        exp: 1234567999,
      };

      const req = {
        headers: {
          authorization: 'Bearer valid-token-123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      mockedVerifyToken.mockResolvedValueOnce(mockUser);

      await authenticate(req, res, next);

      expect(mockedVerifyToken).toHaveBeenCalledWith('valid-token-123');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', async () => {
      const req = {
        headers: {},
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization header missing',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing from Bearer header', async () => {
      const req = {
        headers: {
          authorization: 'Bearer ',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token missing',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is malformed', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token missing',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      mockedVerifyToken.mockRejectedValueOnce(new Error('Invalid token'));

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is blacklisted', async () => {
      const req = {
        headers: {
          authorization: 'Bearer blacklisted-token',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      mockedVerifyToken.mockRejectedValueOnce(new Error('Token has been blacklisted'));

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      const req = {
        headers: {
          authorization: 'Bearer some-token',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      mockedVerifyToken.mockRejectedValueOnce('String error');

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should allow access when user has required role', () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'ADMIN',
          jti: 'jwt-123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize('ADMIN', 'SUPER_ADMIN');
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple required roles', () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'SCHOOL_MANAGER',
          jti: 'jwt-123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize('ADMIN', 'SCHOOL_MANAGER', 'TEACHER');
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', () => {
      const req = {} as AuthRequest; // No user property
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize('ADMIN');
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have required role', () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'STUDENT',
          jti: 'jwt-123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize('ADMIN', 'SCHOOL_MANAGER');
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You do not have permission to access this resource',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle empty allowed roles list', () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'ADMIN',
          jti: 'jwt-123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize(); // No roles specified
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You do not have permission to access this resource',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500 status', () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'ADMIN',
          jti: 'jwt-123',
        },
      } as AuthRequest;
      const res = {
        status: jest.fn(() => {
          throw new Error('Response error');
        }),
        json: jest.fn().mockReturnThis(),
      } as any;
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize('ADMIN');
      authorizeMiddleware(req, res, next);

      // The error should be caught and handled
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        data: null,
      });
    });

    it('should be case-sensitive for role matching', () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'admin', // lowercase
          jti: 'jwt-123',
        },
      } as AuthRequest;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const authorizeMiddleware = authorize('ADMIN'); // uppercase
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You do not have permission to access this resource',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
