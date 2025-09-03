import { AuthService } from '../../src/services/AuthService';
import { TestSetup } from '../helpers/testSetup';
import { Database } from '../../src/database';
import { redis } from '../../src/utils/redis';
import { sendMail } from '../../src/utils/mailer';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../../src/utils/helper';

// Mock the mailer to avoid sending actual emails during tests
jest.mock('../../src/utils/mailer');
const mockedSendMail = sendMail as jest.MockedFunction<typeof sendMail>;

describe('AuthService', () => {
  beforeAll(async () => {
    await TestSetup.beforeAll();
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  beforeEach(async () => {
    await TestSetup.beforeEach();
    jest.clearAllMocks();
  });

  describe('registerWithEmail', () => {
    it('should successfully register a new user', async () => {
      const testUser = TestSetup.createTestUser();
      const res = TestSetup.createMockResponse();

      const result = await AuthService.registerWithEmail(testUser, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Registration successful',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: testUser.email,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
            }),
            token: expect.any(String),
          }),
        })
      );

      // Verify user was created in database
      const createdUser = await Database.User.findOne({
        where: { email: testUser.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.firstName).toBe(testUser.firstName);
    });

    it('should return 409 if email already exists', async () => {
      const testUser = TestSetup.createTestUser();
      const res1 = TestSetup.createMockResponse();
      const res2 = TestSetup.createMockResponse();

      // Register user first time
      await AuthService.registerWithEmail(testUser, res1);

      // Try to register same email again
      await AuthService.registerWithEmail(testUser, res2);

      expect(res2.status).toHaveBeenCalledWith(409);
      expect(res2.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email already in use',
        })
      );
    });

    it('should hash password before storing', async () => {
      const testUser = TestSetup.createTestUser();
      const res = TestSetup.createMockResponse();

      await AuthService.registerWithEmail(testUser, res);

      const createdUser = await Database.User.findOne({
        where: { email: testUser.email },
      });

      expect(createdUser?.password).toBeDefined();
      expect(createdUser?.password).not.toBe(testUser.password);
      
      // Verify password was hashed correctly
      const isValidHash = await comparePassword(testUser.password, createdUser?.password!);
      expect(isValidHash).toBe(true);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const testUser = TestSetup.createTestUser();
      const registerRes = TestSetup.createMockResponse();
      const loginRes = TestSetup.createMockResponse();

      // First register the user
      await AuthService.registerWithEmail(testUser, registerRes);

      // Then try to login
      const loginDto = {
        email: testUser.email,
        password: testUser.password,
      };

      await AuthService.login(loginDto, loginRes);

      expect(loginRes.status).toHaveBeenCalledWith(200);
      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: testUser.email,
            }),
            token: expect.any(String),
          }),
        })
      );
    });

    it('should return 401 for non-existent user', async () => {
      const res = TestSetup.createMockResponse();

      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await AuthService.login(loginDto, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        })
      );
    });

    it('should return 401 for incorrect password', async () => {
      const testUser = TestSetup.createTestUser();
      const registerRes = TestSetup.createMockResponse();
      const loginRes = TestSetup.createMockResponse();

      // Register the user
      await AuthService.registerWithEmail(testUser, registerRes);

      // Try to login with wrong password
      const loginDto = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      await AuthService.login(loginDto, loginRes);

      expect(loginRes.status).toHaveBeenCalledWith(401);
      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Incorrect password',
        })
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid token', async () => {
      const testUser = TestSetup.createTestUser();
      const registerRes = TestSetup.createMockResponse();
      const loginRes = TestSetup.createMockResponse();
      const logoutRes = TestSetup.createMockResponse();

      // Register and login to get a token
      await AuthService.registerWithEmail(testUser, registerRes);
      await AuthService.login({ email: testUser.email, password: testUser.password }, loginRes);

      // Extract token from login response
      const loginCall = loginRes.json.mock.calls[0][0];
      const token = loginCall.data.token;

      await AuthService.logout(token, logoutRes);

      expect(logoutRes.status).toHaveBeenCalledWith(200);
      expect(logoutRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Logged out successfully',
        })
      );

      // Verify token is blacklisted
      const blacklisted = await redis.get(`blacklist:${token}`);
      expect(blacklisted).toBe('true');
    });

    it('should handle missing token', async () => {
      const res = TestSetup.createMockResponse();

      await AuthService.logout(undefined, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe('forgotPassword', () => {
    it('should successfully send reset link for existing user', async () => {
      const testUser = TestSetup.createTestUser();
      const registerRes = TestSetup.createMockResponse();
      const forgotRes = TestSetup.createMockResponse();

      // Register the user first
      await AuthService.registerWithEmail(testUser, registerRes);

      // Mock sendMail to succeed
      mockedSendMail.mockResolvedValueOnce();

      const forgotDto = { email: testUser.email };
      await AuthService.forgotPassword(forgotDto, forgotRes);

      expect(forgotRes.status).toHaveBeenCalledWith(200);
      expect(forgotRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Password reset link sent to your email',
          data: expect.objectContaining({
            token: expect.any(String),
          }),
        })
      );

      // Verify email was sent
      expect(mockedSendMail).toHaveBeenCalledWith(
        testUser.email,
        'Reset Your Password',
        expect.stringContaining('Password Reset Request')
      );

      // Verify reset token was stored in Redis
      const forgotCall = forgotRes.json.mock.calls[0][0];
      const resetToken = forgotCall.data.token;
      const userId = await redis.get(`reset:${resetToken}`);
      expect(userId).toBeTruthy();
    });

    it('should return 404 for non-existent user', async () => {
      const res = TestSetup.createMockResponse();

      const forgotDto = { email: 'nonexistent@example.com' };
      await AuthService.forgotPassword(forgotDto, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not found',
        })
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const testUser = TestSetup.createTestUser();
      const registerRes = TestSetup.createMockResponse();
      const forgotRes = TestSetup.createMockResponse();
      const resetRes = TestSetup.createMockResponse();

      // Register user and request password reset
      await AuthService.registerWithEmail(testUser, registerRes);
      
      // Mock sendMail for forgot password
      mockedSendMail.mockResolvedValueOnce();
      
      await AuthService.forgotPassword({ email: testUser.email }, forgotRes);

      // Get the reset token
      const forgotCall = forgotRes.json.mock.calls[0][0];
      const resetToken = forgotCall.data.token;

      // Reset password
      const newPassword = 'NewPassword123!';
      const resetDto = { token: resetToken, newPassword };
      await AuthService.resetPassword(resetDto, resetRes);

      expect(resetRes.status).toHaveBeenCalledWith(200);
      expect(resetRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Password updated successfully',
        })
      );

      // Verify password was changed in database
      const user = await Database.User.findOne({ where: { email: testUser.email } });
      const isNewPasswordValid = await comparePassword(newPassword, user?.password!);
      expect(isNewPasswordValid).toBe(true);

      // Verify reset token was removed from Redis
      const tokenInRedis = await redis.get(`reset:${resetToken}`);
      expect(tokenInRedis).toBe(null);
    });

    it('should return 400 for invalid or expired token', async () => {
      const res = TestSetup.createMockResponse();

      const resetDto = {
        token: 'invalid-token',
        newPassword: 'NewPassword123!',
      };

      await AuthService.resetPassword(resetDto, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid or expired token',
        })
      );
    });
  });
});
