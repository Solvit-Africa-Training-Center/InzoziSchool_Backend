// validation/school.validation.ts
import Joi from 'joi';
import { ISchoolRegister,IRejectSchool } from '../types/School';

export const SchoolRegisterSchema = Joi.object<ISchoolRegister>({
  schoolName: Joi.string().required(),
  schoolCode: Joi.string().required(),
  email: Joi.string().email().required(),
  district: Joi.string().required(),
  licenseDocument: Joi.string().optional(), 
  province: Joi.string().optional(),
  sector: Joi.string().optional(),
  cell: Joi.string().optional(),
  village: Joi.string().optional(),
  schoolCategory: Joi.string().valid('REB', 'RTB').optional(),
  schoolLevel: Joi.string().valid('Nursery', 'Primary', 'O-Level', 'A-Level').optional(),
  schoolType: Joi.string().valid('Girls', 'Boys', 'Mixed').optional(),
});

export const RejectSchoolSchema = Joi.object<IRejectSchool>({
  reason: Joi.string().required(),
});
