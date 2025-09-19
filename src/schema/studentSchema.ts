import Joi from 'joi';

export const studentSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().optional(),
  lastName: Joi.string().required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
  DOB: Joi.date().required(),
  indexNumber: Joi.string().when('studentType', {
    is: 'newcomer',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  studentType: Joi.string().valid('newcomer', 'ongoing').required(),

  resultSlip: Joi.any().when('studentType', {
    is: 'newcomer',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  previousReport: Joi.any().when('studentType', {
    is: 'ongoing',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  mitationLetter: Joi.any().when('studentType', {
    is: 'ongoing',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  passportPhoto: Joi.any().required(),
  babyeyiDocument: Joi.any().optional(),

  fathersNames: Joi.string().required(),
  mothersNames: Joi.string().required(),
  representerEmail: Joi.string().email().required(),
  representerPhone: Joi.string().required(),

  nationality: Joi.string().required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().required(),
  cell: Joi.string().required(),
  village: Joi.string().required(),

  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
});