import { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/authControllers';
import { AuthService } from '../../src/services/AuthService';
import { TestSetup } from '../helpers/testSetup';

// Mock AuthService
jest.mock('../../src/services/AuthService');
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthController', () => {
  beforeAll(async () => {
    await TestSetup.beforeAll();
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call AuthService.registerWithEmail with correct parameters', async () => {
      const testUser = TestSetup.createTestUser();
      const req = {
        body: testUser,
      } as Request;
      const res = TestSetup.createMockResponse();

      mockedAuthService.registerWithEmail.mockResolvedValueOnce(undefined);

      await AuthController.register(req, res);

      expect(mockedAuthService.registerWithEmail).toHaveBeenCalledWith(testUser, res);
      expect(mockedAuthService.registerWithEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and return 500 status', async () => {
      const testUser = TestSetup.createTestUser();
      const req = {
        body: testUser,
      } as Request;
      const res = TestSetup.createMockResponse();

      const error = new Error('Database connection failed');
      mockedAuthService.registerWithEmail.mockRejectedValueOnce(error);

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        data: {
          message: 'Database connection failed',
          stack: expect.any(String),
        },
      });
    });

    it('should handle errors without stack trace', async () => {
      const testUser = TestSetup.createTestUser();
      const req = {
        body: testUser,
      } as Request;
      const res = TestSetup.createMockResponse();

      const error = { message: 'Custom error' };
      mockedAuthService.registerWithEmail.mockRejectedValueOnce(error);

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        data: {
          message: 'Custom error',
          stack: undefined,
        },
      });
    });
  });

  describe('login', () => {
    it('should call AuthService.login with correct parameters', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const req = {
        body: loginData,
      } as Request;
      const res = TestSetup.createMockResponse();

      mockedAuthService.login.mockResolvedValueOnce(undefined);

      await AuthController.login(req, res);

      expect(mockedAuthService.login).toHaveBeenCalledWith(loginData, res);
      expect(mockedAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and return 500 status', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const req = {
        body: loginData,
      } as Request;
      const res = TestSetup.createMockResponse();

      const error = new Error('Authentication failed');
      mockedAuthService.login.mockRejectedValueOnce(error);

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Login failed',
        data: {
          message: 'Authentication failed',
          stack: expect.any(String),
        },
      });
    });
  });

  describe('logout', () => {
    it('should call AuthService.logout with valid Bearer token', async () => {
      const token = 'valid-jwt-token';
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = TestSetup.createMockResponse();

      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      await AuthController.logout(req, res);

      expect(mockedAuthService.logout).toHaveBeenCalledWith(token, res);
      expect(mockedAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when authorization header is missing', async () => {
      const req = {
        headers: {},
      } as Request;
      const res = TestSetup.createMockResponse();

      await AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token missing or malformed',
        data: null,
      });
      expect(mockedAuthService.logout).not.toHaveBeenCalled();
    });

    it('should return 400 when authorization header is malformed', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token123',
        },
      } as Request;
      const res = TestSetup.createMockResponse();

      await AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token missing or malformed',
        data: null,
      });
      expect(mockedAuthService.logout).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500 status', async () => {
      const token = 'valid-jwt-token';
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = TestSetup.createMockResponse();

      const error = new Error('Token invalidation failed');
      mockedAuthService.logout.mockRejectedValueOnce(error);

      await AuthController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Logout failed',
        data: {
          message: 'Token invalidation failed',
          stack: expect.any(String),
        },
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call AuthService.forgotPassword with correct parameters', async () => {
      const forgotData = {
        email: 'test@example.com',
      };
      const req = {
        body: forgotData,
      } as Request;
      const res = TestSetup.createMockResponse();

      mockedAuthService.forgotPassword.mockResolvedValueOnce(undefined);

      await AuthController.forgotPassword(req, res);

      expect(mockedAuthService.forgotPassword).toHaveBeenCalledWith(forgotData, res);
      expect(mockedAuthService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and return 500 status', async () => {
      const forgotData = {
        email: 'test@example.com',
      };
      const req = {
        body: forgotData,
      } as Request;
      const res = TestSetup.createMockResponse();

      const error = new Error('Email service failed');
      mockedAuthService.forgotPassword.mockRejectedValueOnce(error);

      await AuthController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to send password reset link',
        data: {
          message: 'Email service failed',
          stack: expect.any(String),
        },
      });
    });
  });

  describe('resetPassword', () => {
    it('should call AuthService.resetPassword with correct parameters', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'NewPassword123!',
      };
      const req = {
        body: resetData,
      } as Request;
      const res = TestSetup.createMockResponse();

      mockedAuthService.resetPassword.mockResolvedValueOnce(undefined);

      await AuthController.resetPassword(req, res);

      expect(mockedAuthService.resetPassword).toHaveBeenCalledWith(resetData, res);
      expect(mockedAuthService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and return 500 status', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'NewPassword123!',
      };
      const req = {
        body: resetData,
      } as Request;
      const res = TestSetup.createMockResponse();

      const error = new Error('Password update failed');
      mockedAuthService.resetPassword.mockRejectedValueOnce(error);

      await AuthController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password reset failed',
        data: {
          message: 'Password update failed',
          stack: expect.any(String),
        },
      });
    });
  });
});
