import Joi from 'joi';

export const createApplicationSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
});
