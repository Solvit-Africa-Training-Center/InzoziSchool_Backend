import supertest from 'supertest';
import { app } from '../../src/server';
import { TestSetup } from '../helpers/testSetup';
import { Database } from '../../src/database';
import { redis } from '../../src/utils/redis';
import { sendMail } from '../../src/utils/mailer';

// Mock the mailer
jest.mock('../../src/utils/mailer');
const mockedSendMail = sendMail as jest.MockedFunction<typeof sendMail>;

const request = supertest(app);

describe('Authentication Routes Integration Tests', () => {
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

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const testUser = TestSetup.createTestUser();

      const response = await request
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Registration successful',
        data: {
          user: expect.objectContaining({
            email: testUser.email,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
          }),
          token: expect.any(String),
        },
      });

      // Verify user was created in database
      const createdUser = await Database.User.findOne({
        where: { email: testUser.email },
      });
      expect(createdUser).toBeTruthy();
    });

    it('should return 400 for invalid data', async () => {
      const invalidUser = {
        firstName: 'A', // Too short
        lastName: 'B', // Too short
        email: 'invalid-email', // Invalid format
      };

      const response = await request
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const testUser = TestSetup.createTestUser();

      // Register user first time
      await request.post('/api/auth/register').send(testUser).expect(201);

      // Try to register again with same email
      const response = await request
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Email already in use',
      });
    });

    it('should validate required fields', async () => {
      const incompleteUser = {
        firstName: 'John',
        // Missing other required fields
      };

      const response = await request
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate password complexity', async () => {
      const testUser = {
        ...TestSetup.createTestUser(),
        password: 'weak', // Too weak
      };

      const response = await request
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user for login tests
      const testUser = TestSetup.createTestUser();
      await request.post('/api/auth/register').send(testUser);
    });

    it('should successfully login with valid credentials', async () => {
      const testUser = TestSetup.createTestUser();

      const response = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: expect.objectContaining({
            email: testUser.email,
          }),
          token: expect.any(String),
        },
      });
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid credentials',
      });
    });

    it('should return 401 for incorrect password', async () => {
      const testUser = TestSetup.createTestUser();

      const response = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Incorrect password',
      });
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get a token
      const testUser = TestSetup.createTestUser();
      await request.post('/api/auth/register').send(testUser);
      
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should successfully logout with valid token', async () => {
      const response = await request
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully',
      });

      // Verify token is blacklisted
      const blacklisted = await redis.get(`blacklist:${authToken}`);
      expect(blacklisted).toBe('true');
    });

    it('should return 401 when authorization header is missing', async () => {
      const response = await request
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Authorization header missing',
      });
    });

    it('should return 401 for malformed authorization header', async () => {
      const response = await request
        .post('/api/auth/logout')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Token missing',
      });
    });

    it('should return 401 for invalid token', async () => {
      const response = await request
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Unauthorized',
      });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Register a test user
      const testUser = TestSetup.createTestUser();
      await request.post('/api/auth/register').send(testUser);
    });

    it('should successfully send reset link for existing user', async () => {
      const testUser = TestSetup.createTestUser();
      
      // Mock sendMail to succeed
      mockedSendMail.mockResolvedValueOnce();

      const response = await request
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset link sent to your email',
        data: {
          token: expect.any(String),
        },
      });

      // Verify email was sent
      expect(mockedSendMail).toHaveBeenCalledWith(
        testUser.email,
        'Reset Your Password',
        expect.stringContaining('Password Reset Request')
      );
    });

    it('should return 404 for non-existent email', async () => {
      const response = await request
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing email', async () => {
      const response = await request
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Register user and request password reset
      const testUser = TestSetup.createTestUser();
      await request.post('/api/auth/register').send(testUser);
      
      // Mock sendMail for forgot password
      mockedSendMail.mockResolvedValueOnce();
      
      const forgotResponse = await request
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });
      
      resetToken = forgotResponse.body.data.token;
    });

    it('should successfully reset password with valid token', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password updated successfully',
      });

      // Verify user can login with new password
      const testUser = TestSetup.createTestUser();
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should return 400 for invalid token', async () => {
      const response = await request
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid or expired token',
      });
    });

    it('should return 400 for weak password', async () => {
      const response = await request
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request
        .post('/api/auth/reset-password')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not allow reusing the same token twice', async () => {
      const newPassword = 'NewPassword123!';

      // Use token first time
      await request
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword,
        })
        .expect(200);

      // Try to use same token again
      const response = await request
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid or expired token',
      });
    });
  });
});
