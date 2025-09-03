import { Request, Response, NextFunction } from 'express';
import { ValidationMiddleware } from '../../src/middlewares/validationMiddleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../src/utils/validationSchemas';
import { TestSetup } from '../helpers/testSetup';

describe('Validation Tests', () => {
  beforeAll(async () => {
    await TestSetup.beforeAll();
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  describe('Validation Schemas', () => {
    describe('registerSchema', () => {
      it('should validate valid registration data', () => {
        const validData = TestSetup.createTestUser();
        
        const { error } = registerSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid firstName (too short)', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          firstName: 'A', // Too short
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('at least 2 characters');
      });

      it('should reject invalid firstName (too long)', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          firstName: 'A'.repeat(51), // Too long
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('not exceed 50 characters');
      });

      it('should reject invalid email format', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          email: 'invalid-email',
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('valid email');
      });

      it('should reject invalid phone format', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          phone: '123456789', // Invalid format
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('valid Rwandan number');
      });

      it('should accept valid phone formats', () => {
        const validFormats = ['0788123456', '0787654321', '+250788123456', '25788123456'];
        
        validFormats.forEach(phone => {
          const validData = {
            ...TestSetup.createTestUser(),
            phone,
          };
          
          const { error } = registerSchema.validate(validData);
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid gender', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          gender: 'Invalid',
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('either Male, Female, or Other');
      });

      it('should accept valid genders', () => {
        const validGenders = ['Male', 'Female', 'Other'];
        
        validGenders.forEach(gender => {
          const validData = {
            ...TestSetup.createTestUser(),
            gender,
          };
          
          const { error } = registerSchema.validate(validData);
          expect(error).toBeUndefined();
        });
      });

      it('should reject weak password (too short)', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          password: '1234567', // Too short
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('at least 8 characters');
      });

      it('should reject password without uppercase', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          password: 'password123', // No uppercase
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('uppercase letter');
      });

      it('should reject password without lowercase', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          password: 'PASSWORD123', // No lowercase
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('uppercase letter');
      });

      it('should reject password without number', () => {
        const invalidData = {
          ...TestSetup.createTestUser(),
          password: 'Password', // No number
        };
        
        const { error } = registerSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('uppercase letter');
      });

      it('should require all fields', () => {
        const requiredFields = ['firstName', 'lastName', 'gender', 'province', 'district', 'sector', 'cell', 'village', 'phone', 'email', 'password'];
        
        requiredFields.forEach(field => {
          const incompleteData = { ...TestSetup.createTestUser() };
          delete (incompleteData as any)[field];
          
          const { error } = registerSchema.validate(incompleteData);
          expect(error).toBeDefined();
          expect(error?.details?.[0]?.message).toContain('required');
        });
      });

      it('should allow optional schoolId', () => {
        const validDataWithSchoolId = {
          ...TestSetup.createTestUser(),
          schoolId: '123e4567-e89b-12d3-a456-426614174000',
        };
        
        const { error } = registerSchema.validate(validDataWithSchoolId);
        expect(error).toBeUndefined();
      });
    });

    describe('loginSchema', () => {
      it('should validate valid login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
        };
        
        const { error } = loginSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid email format', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'Password123!',
        };
        
        const { error } = loginSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('valid email');
      });

      it('should require email and password', () => {
        const { error: emailError } = loginSchema.validate({ password: 'test' });
        expect(emailError).toBeDefined();
        expect(emailError?.details?.[0]?.message).toContain('required');

        const { error: passwordError } = loginSchema.validate({ email: 'test@example.com' });
        expect(passwordError).toBeDefined();
        expect(passwordError?.details?.[0]?.message).toContain('required');
      });
    });

    describe('forgotPasswordSchema', () => {
      it('should validate valid forgot password data', () => {
        const validData = {
          email: 'test@example.com',
        };
        
        const { error } = forgotPasswordSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid email format', () => {
        const invalidData = {
          email: 'invalid-email',
        };
        
        const { error } = forgotPasswordSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('valid email');
      });

      it('should require email', () => {
        const { error } = forgotPasswordSchema.validate({});
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('required');
      });
    });

    describe('resetPasswordSchema', () => {
      it('should validate valid reset password data', () => {
        const validData = {
          token: 'valid-reset-token',
          newPassword: 'NewPassword123!',
        };
        
        const { error } = resetPasswordSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject weak new password', () => {
        const invalidData = {
          token: 'valid-reset-token',
          newPassword: 'weak',
        };
        
        const { error } = resetPasswordSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details?.[0]?.message).toContain('at least 8 characters');
      });

      it('should require token and newPassword', () => {
        const { error: tokenError } = resetPasswordSchema.validate({ newPassword: 'Password123!' });
        expect(tokenError).toBeDefined();
        expect(tokenError?.details?.[0]?.message).toContain('required');

        const { error: passwordError } = resetPasswordSchema.validate({ token: 'token' });
        expect(passwordError).toBeDefined();
        expect(passwordError?.details?.[0]?.message).toContain('required');
      });
    });
  });

  describe('ValidationMiddleware', () => {
    it('should pass valid data through', () => {
      const validData = TestSetup.createTestUser();
      const req = {
        body: validData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: registerSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data', () => {
      const invalidData = {
        firstName: 'A', // Too short
        email: 'invalid-email',
      };
      const req = {
        body: invalidData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: registerSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation error',
          errors: expect.any(Array),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const validData = {
        email: 'test@example.com',
      };
      const req = {
        query: validData,
      } as unknown as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'query', schema: forgotPasswordSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should validate params', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };
      const req = {
        params: validData,
      } as unknown as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const paramSchema = require('joi').object({
        id: require('joi').string().uuid().required(),
      });

      const middleware = ValidationMiddleware({ type: 'params', schema: paramSchema });
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors', () => {
      const invalidData = {
        firstName: 'A', // Too short
        lastName: 'B', // Too short  
        email: 'invalid-email', // Invalid format
        password: 'weak', // Too weak
      };
      const req = {
        body: invalidData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: registerSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.errors.length).toBeGreaterThan(1);
      expect(next).not.toHaveBeenCalled();
    });

    it('should format error messages properly', () => {
      const invalidData = {
        email: 'invalid-email',
      };
      const req = {
        body: invalidData,
      } as Request;
      const res = TestSetup.createMockResponse();
      const next = jest.fn() as NextFunction;

      const middleware = ValidationMiddleware({ type: 'body', schema: forgotPasswordSchema });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.errors[0]).toEqual({
        field: 'email',
        message: expect.any(String),
      });
    });
  });
});
