import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters'
  }),
  
  lastName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters'
  }),
  
  gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
    'any.only': 'Gender must be either Male, Female, or Other',
    'any.required': 'Gender is required'
  }),
  
  province: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Province is required',
    'string.min': 'Province must be at least 2 characters long',
    'string.max': 'Province must not exceed 50 characters'
  }),
  
  district: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'District is required',
    'string.min': 'District must be at least 2 characters long',
    'string.max': 'District must not exceed 50 characters'
  }),
  
  sector: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Sector is required',
    'string.min': 'Sector must be at least 2 characters long',
    'string.max': 'Sector must not exceed 50 characters'
  }),
  
  cell: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Cell is required',
    'string.min': 'Cell must be at least 2 characters long',
    'string.max': 'Cell must not exceed 50 characters'
  }),
  
  village: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Village is required',
    'string.min': 'Village must be at least 2 characters long',
    'string.max': 'Village must not exceed 50 characters'
  }),
  
  phone: Joi.string().pattern(/^(\+?25)?(07[0-9]{8})$/).required().messages({
    'string.pattern.base': 'Phone number must be a valid Rwandan number (e.g., 0788123456)',
    'any.required': 'Phone number is required'
  }),
  
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  }),
  
  schoolId: Joi.string().uuid().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': 'New password must be at least 8 characters long',
    'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'New password is required'
  })
});
