import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationMiddleware } from '../../src/middlewares/validationMiddleware';
import { TestSetup } from '../helpers/testSetup';

describe('ValidationMiddleware', () => {
  beforeAll(async () => {
    await TestSetup.beforeAll();
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  const testSchema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    age: Joi.number().min(0).max(120).optional(),
  });

  describe('Body validation', () => {
    it('should pass valid data through', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };
      const req = {
        body: validData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: testSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data', () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
      };
      const req = {
        body: invalidData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: testSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
          data: expect.any(Array),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', () => {
      const incompleteData = {
        name: 'John Doe',
        // Missing required email
      };
      const req = {
        body: incompleteData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: testSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('email'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors', () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        age: -5, // Negative age
      };
      const req = {
        body: invalidData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: testSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.data).toHaveLength(3); // 3 validation errors
      expect(next).not.toHaveBeenCalled();
    });

    it('should ignore optional fields when not provided', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        // age is optional, not provided
      };
      const req = {
        body: validData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: testSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Headers validation', () => {
    const headerSchema = Joi.object({
      'content-type': Joi.string().required(),
      'authorization': Joi.string().optional(),
    });

    it('should validate headers successfully', () => {
      const req = {
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer token123',
        },
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'headers', schema: headerSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject missing required headers', () => {
      const req = {
        headers: {
          // Missing required content-type
        },
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'headers', schema: headerSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Params validation', () => {
    const paramSchema = Joi.object({
      id: Joi.string().uuid().required(),
      slug: Joi.string().alphanum().optional(),
    });

    it('should validate params successfully', () => {
      const req = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          slug: 'test123',
        },
      } as unknown as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'params', schema: paramSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid UUID in params', () => {
      const req = {
        params: {
          id: 'invalid-uuid',
        },
      } as unknown as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'params', schema: paramSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle schema validation exceptions', () => {
      const malformedSchema = {
        validate: jest.fn().mockImplementation(() => {
          throw new Error('Schema validation failed');
        }),
      } as any;

      const req = {
        body: { test: 'data' },
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      // Mock console.log to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const middleware = ValidationMiddleware({ type: 'body', schema: malformedSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          data: expect.any(Error),
        })
      );
      expect(next).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Validation error:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle undefined request properties', () => {
      const req = {} as Request; // No body, headers, or params
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: testSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Integration with Joi schemas', () => {
    it('should work with complex nested schemas', () => {
      const nestedSchema = Joi.object({
        user: Joi.object({
          profile: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
          }).required(),
          contact: Joi.object({
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
          }).required(),
        }).required(),
        preferences: Joi.array().items(Joi.string()).optional(),
      });

      const validComplexData = {
        user: {
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
          contact: {
            email: 'john@example.com',
            phone: '1234567890',
          },
        },
        preferences: ['email', 'sms'],
      };

      const req = {
        body: validComplexData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: nestedSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should work with custom validation messages', () => {
      const customSchema = Joi.object({
        username: Joi.string().required().messages({
          'string.empty': 'Username cannot be empty',
          'any.required': 'Username is absolutely required',
        }),
        password: Joi.string().min(8).required().messages({
          'string.min': 'Password must be at least 8 characters',
          'any.required': 'Password is required for security',
        }),
      });

      const invalidData = {
        username: '',
        // password missing
      };

      const req = {
        body: invalidData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: customSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.message).toContain('Username cannot be empty');
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with conditional validation', () => {
      const conditionalSchema = Joi.object({
        type: Joi.string().valid('email', 'phone').required(),
        value: Joi.when('type', {
          is: 'email',
          then: Joi.string().email().required(),
          otherwise: Joi.string().pattern(/^[0-9]{10}$/).required(),
        }),
      });

      // Test email case
      const emailData = {
        type: 'email',
        value: 'test@example.com',
      };

      const emailReq = { body: emailData } as Request;
      const emailRes = TestSetup.createMockResponse();
      const emailNext = jest.fn() as NextFunction;

      const emailMiddleware = ValidationMiddleware({ type: 'body', schema: conditionalSchema });
      emailMiddleware(emailReq, emailRes, emailNext);

      expect(emailNext).toHaveBeenCalledWith();

      // Test phone case
      const phoneData = {
        type: 'phone',
        value: '1234567890',
      };

      const phoneReq = { body: phoneData } as Request;
      const phoneRes = TestSetup.createMockResponse();
      const phoneNext = jest.fn() as NextFunction;

      const phoneMiddleware = ValidationMiddleware({ type: 'body', schema: conditionalSchema });
      phoneMiddleware(phoneReq, phoneRes, phoneNext);

      expect(phoneNext).toHaveBeenCalledWith();
    });
  });
});
