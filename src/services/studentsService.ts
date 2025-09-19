import { Response } from 'express';
import { sequelize, AllModal } from '../database';
import { IStudent } from '../types/studentInterface';
import { ResponseService } from '../utils/response';
import { sendEmail } from '../utils/email';
import { EmailTemplates } from '../templates/emailTemplates';

const models = AllModal(sequelize);
const Student = models.Student;
const Application = models.Application;

interface AuthUser {
  role: string;
  schoolId: string;
}

function validateStudentFiles(
  studentType: string,
  files: Record<string, Express.Multer.File[]> | undefined
) {
  const getUrl = (field: string): string | undefined => files?.[field]?.[0]?.path;

  const passportPhoto = getUrl('passportPhoto');
  if (!passportPhoto) throw new Error('passportPhoto is required for all students');

  if (studentType === 'newcomer') {
    if (!getUrl('resultSlip')) throw new Error('resultSlip is required for newcomer students');
  } else if (studentType === 'ongoing') {
    if (!getUrl('previousReport') || !getUrl('mitationLetter')) {
      throw new Error('previousReport and mitationLetter are required for ongoing students');
    }
  }

  return {
    passportPhoto,
    resultSlip: getUrl('resultSlip') ?? '',
    previousReport: getUrl('previousReport') ?? '',
    mitationLetter: getUrl('mitationLetter') ?? '',
  };
}

export class StudentService {
static async createStudent(
    payload: IStudent,
    files: Record<string, Express.Multer.File[]> | undefined,
    res: Response
  ) {
    try {
      const { studentType, indexNumber } = payload;

      // Validate studentType
      if (!['newcomer', 'ongoing'].includes(studentType)) {
        return ResponseService({
          data: null,
          status: 400,
          success: false,
          message: 'Invalid studentType. Must be "newcomer" or "ongoing".',
          res,
        });
      }

      // Newcomer must provide indexNumber
      if (studentType === 'newcomer' && !indexNumber) {
        return ResponseService({
          data: null,
          status: 400,
          success: false,
          message: 'indexNumber is required for newcomer students',
          res,
        });
      }

      // Validate files
      const getFilePath = (field: string): string | undefined => files?.[field]?.[0]?.path;

      const passportPhoto = getFilePath('passportPhoto');
      if (!passportPhoto)
        return ResponseService({
          data: null,
          status: 400,
          success: false,
          message: 'passportPhoto is required for all students',
          res,
        });

      let resultSlip = '';
      let previousReport = '';
      let mitationLetter = '';

      if (studentType === 'newcomer') {
        resultSlip = getFilePath('resultSlip') ?? '';
        if (!resultSlip) {
          return ResponseService({
            data: null,
            status: 400,
            success: false,
            message: 'resultSlip is required for newcomer students',
            res,
          });
        }
      } else if (studentType === 'ongoing') {
        previousReport = getFilePath('previousReport') ?? '';
        mitationLetter = getFilePath('mitationLetter') ?? '';
        if (!previousReport || !mitationLetter) {
          return ResponseService({
            data: null,
            status: 400,
            success: false,
            message: 'previousReport and mitationLetter are required for ongoing students',
            res,
          });
        }
      }

      // Create student
      const student = await Student.create({
        ...payload,
        studentType,
        ...(indexNumber ? { indexNumber } : {}),
        passportPhoto,
        resultSlip,
        previousReport,
        mitationLetter,
        status: 'pending',
      });

      // Create related Application
      try {
        await student.createApplication({ status: 'pending' }); // Sequelize association
      } catch (err) {
        console.error('Application creation failed:', err instanceof Error ? err.message : err);
      }

      // Send confirmation email
      try {
        await sendEmail({
          to: student.representerEmail,
          subject: 'Student Registration Confirmation',
          html: EmailTemplates.confirmation(student),
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr instanceof Error ? emailErr.message : emailErr);
      }

      return ResponseService({
        data: student,
        status: 201,
        success: true,
        message: 'Student registered successfully. Confirmation email sent.',
        res,
      });
    } catch (error) {
      console.error('StudentService.createStudent error:', error);
      return ResponseService({
        data: { error: error instanceof Error ? error.message : JSON.stringify(error) },
        status: 500,
        success: false,
        message: 'Failed to register student',
        res,
      });
    }
  }

  static async getStudentById(id: string, user: AuthUser, res: Response) {
    try {
      if (!['AdmissionManager', 'SchoolManager'].includes(user.role)) {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'Unauthorized access',
          res,
        });
      }

      const student = await Student.findOne({
        where: { id, schoolId: user.schoolId },
        include: ['school', 'application'],
      });

      if (!student) {
        return ResponseService({
          data: null,
          status: 404,
          success: false,
          message: 'Student not found',
          res,
        });
      }

      return ResponseService({ data: student, status: 200, success: true, res });
    } catch (error) {
      console.error('StudentService.getStudentById error:', error);
      return ResponseService({
        data: { error: (error as Error).message },
        status: 500,
        success: false,
        res,
      });
    }
  }

  static async getAllStudents(user: AuthUser, res: Response) {
    try {
      if (!['AdmissionManager', 'SchoolManager'].includes(user.role)) {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'Unauthorized access',
          res,
        });
      }

      const students = await Student.findAll({
        where: { schoolId: user.schoolId },
        include: ['school', 'application'],
      });

      return ResponseService({ data: students, status: 200, success: true, res });
    } catch (error) {
      console.error('StudentService.getAllStudents error:', error);
      return ResponseService({
        data: { error: (error as Error).message },
        status: 500,
        success: false,
        res,
      });
    }
  }

  static async updateStudentStatus(
    id: string,
    status: 'approved' | 'rejected',
    user: AuthUser,
    res: Response
  ) {
    try {
      if (!['AdmissionManager', 'SchoolManager'].includes(user.role)) {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'Unauthorized access',
          res,
        });
      }

      const student = await Student.findOne({
        where: { id, schoolId: user.schoolId },
        include: ['school', 'application'],
      });

      if (!student) {
        return ResponseService({
          data: null,
          status: 404,
          success: false,
          message: 'Student not found',
          res,
        });
      }

      student.status = status;
      await student.save();

      await sendEmail({
        to: student.representerEmail,
        subject: `Admission ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        html: EmailTemplates.admissionStatus(student),
      });

      return ResponseService({
        data: student,
        status: 200,
        success: true,
        message: `Student ${status}`,
        res,
      });
    } catch (error) {
      console.error('StudentService.updateStudentStatus error:', error);
      return ResponseService({
        data: { error: (error as Error).message },
        status: 500,
        success: false,
        res,
      });
    }
  }

  static async issueBabyeyiDocument(
    studentId: string,
    file: Express.Multer.File | undefined,
    user: AuthUser,
    res: Response
  ) {
    try {
      if (user.role !== 'AdmissionManager') {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'Only Admission Managers can issue babyeyi documents',
          res,
        });
      }

      const student = await Student.findOne({ where: { id: studentId, schoolId: user.schoolId } });
      if (!student || student.status !== 'approved') {
        return ResponseService({
          data: null,
          status: 400,
          success: false,
          message: 'Student must be approved before issuing babyeyi',
          res,
        });
      }

      const babyeyiDocument = file?.path;
      if (!babyeyiDocument) {
        return ResponseService({
          data: null,
          status: 400,
          success: false,
          message: 'babyeyiDocument file is required',
          res,
        });
      }

      student.babyeyiDocument = babyeyiDocument;
      student.babyeyiIssuedAt = new Date();
      await student.save();

      await sendEmail({
        to: student.representerEmail,
        subject: 'Admission Document Issued',
        html: EmailTemplates.babyeyiIssued(student),
        attachments: [{ filename: 'babyeyi.pdf', path: babyeyiDocument }],
      });

      return ResponseService({
        data: student,
        status: 200,
        success: true,
        message: 'babyeyiDocument issued and emailed successfully',
        res,
      });
    } catch (error) {
      console.error('StudentService.issueBabyeyiDocument error:', error);
      return ResponseService({
        data: { error: (error as Error).message },
        status: 500,
        success: false,
        res,
      });
    }
  }
}