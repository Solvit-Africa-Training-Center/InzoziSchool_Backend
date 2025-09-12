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
export const UpdateSchoolProfileSchema = Joi.object({
  description: Joi.string().optional(),
  mission: Joi.string().optional(),
  vision: Joi.string().optional(),
  foundedYear: Joi.number().min(1800).max(new Date().getFullYear()).optional(),
  accreditation: Joi.string().optional(),
  languagesOffered: Joi.array().items(Joi.string()).optional(),
  extracurriculars: Joi.array().items(Joi.string()).optional(),
  profilePhoto: Joi.string().uri().optional(),
});

export const CreateSchoolSpotSchema = Joi.object({
  level: Joi.string().valid('Nursery', 'Primary', 'O-level', 'A-level').required(),
  studentType: Joi.string().valid('newcomer', 'transfer').required(),
  academicYear: Joi.string().required(),
   yearofstudy:Joi.string().required,
  totalSpots: Joi.number().integer().min(0).required(),
  occupiedSpots: Joi.number().integer().min(0).optional(),
  registrationOpen: Joi.boolean().optional(),
  waitingListCount: Joi.number().integer().min(0).optional(),
  combination: Joi.array().items(Joi.string()).optional(),
  admissionConditions: Joi.object({
    minGrade: Joi.string().optional(),
    requiredSubjects: Joi.array().items(Joi.string()).optional(),
    examScore: Joi.string().optional(),
    interviewRequired: Joi.boolean().optional(),
    documents: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional(),
  }).optional(),
});

export const UpdateSchoolSpotSchema = CreateSchoolSpotSchema.fork(
  Object.keys(CreateSchoolSpotSchema.describe().keys),
  (schema) => schema.optional()
);

// Gallery
export const CreateSchoolGallerySchema = Joi.object({
  category: Joi.string()
    .valid(
      'classroom',
      'computerLab',
      'library',
      'sports',
      'dining',
      'dormitory',
      'administration',
      'playground'
    )
    .required(),
  caption: Joi.string().optional(),
  isFeatured: Joi.boolean().optional(),
  order: Joi.number().integer().min(0).optional(),
});