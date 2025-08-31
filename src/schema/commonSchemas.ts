import joi from 'joi';
 //UUID validation for primary key IDs (used in routes like /:id)
export const UuidIdSchema = joi.object({
  id: joi.string().uuid().required(),
});
 //UUID validation for user ID parameter
export const UserIdParamSchema = joi.object({
  userId: joi.string().uuid().required(),
});