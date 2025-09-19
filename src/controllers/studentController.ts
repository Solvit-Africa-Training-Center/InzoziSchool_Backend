import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { StudentService } from '../services/studentsService';

export class StudentController {
  static async createStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const payload = req.body;

      // Required fields for registration
      const requiredFields = [
        'firstName', 'lastName', 'gender', 'DOB', 'fathersNames', 'mothersNames',
        'representerEmail', 'representerPhone', 'nationality', 'province', 'district',
        'sector', 'cell', 'village', 'studentType', 'schoolId'
      ];
      const missingFields = requiredFields.filter(field => !payload[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Passport photo is required
      const passportPhotoFile = files?.passportPhoto?.[0];
      if (!passportPhotoFile) {
        return res.status(400).json({
          success: false,
          message: 'passportPhoto file is required',
        });
      }

      // Optional files
      const resultSlipFile = files?.resultSlip?.[0];
      const previousReportFile = files?.previousReport?.[0];
      const mitationLetterFile = files?.mitationLetter?.[0];

      // Prepare student data
      const studentData = {
        ...payload,
        passportPhoto: passportPhotoFile.path,
        resultSlip: resultSlipFile?.path ?? undefined,
        previousReport: previousReportFile?.path ?? undefined,
        mitationLetter: mitationLetterFile?.path ?? undefined,
        indexNumber: payload.indexNumber && payload.indexNumber.trim() !== '' ? payload.indexNumber : undefined,
      };

      // Save student
      return await StudentService.createStudent(studentData, files, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to register student',
        data: { error: (error as Error).message },
      });
    }
  }

  static async getStudentById(req: Request, res: Response) {
    const { id } = req.params;
    const { user } = req as AuthenticatedRequest;

    if (!id) return res.status(400).json({ success: false, message: 'Student ID is required' });
    if (!user) return res.status(403).json({ success: false, message: 'User context missing' });

    return await StudentService.getStudentById(id, user, res);
  }

  static async getAllStudents(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    if (!user) return res.status(403).json({ success: false, message: 'User context missing' });

    return await StudentService.getAllStudents(user, res);
  }

  static async updateStudentStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const { user } = req as AuthenticatedRequest;

    if (!id) return res.status(400).json({ success: false, message: 'Student ID is required' });
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be "approved" or "rejected".' });
    }
    if (!user) return res.status(403).json({ success: false, message: 'User context missing' });

    return await StudentService.updateStudentStatus(id, status, user, res);
  }

  static async issueBabyeyiDocument(req: Request, res: Response) {
    const { id } = req.params;
    const file = req.file;
    const { user } = req as AuthenticatedRequest;

    if (!id) return res.status(400).json({ success: false, message: 'Student ID is required' });
    if (!user) return res.status(403).json({ success: false, message: 'User context missing' });
    if (!file) return res.status(400).json({ success: false, message: 'babyeyiDocument file is required' });

    return await StudentService.issueBabyeyiDocument(id, file, user, res);
  }
}