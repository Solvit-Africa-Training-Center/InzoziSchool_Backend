import { Student } from '../database/models/Student';

export const EmailTemplates = {
  confirmation: (student: Student): string => {
    return `
      <div style=\"font-family: Arial, sans-serif; padding: 20px;\">
        <h2>Student Registration Confirmation</h2>
        <p>Dear ${student.fathersNames || student.mothersNames || 'Parent'},</p>
        <p>We’ve received your registration for <strong>${student.firstName} ${student.lastName}</strong> at <strong>${(student as any).school?.name || 'the selected school'}</strong>.</p>
        <p>Our admissions team will review the application and notify you of the next steps.</p>
        <p>Thank you for choosing us.</p>
        <br/>
        <p>Best regards,<br/>Inzozi School Admissions</p>
      </div>
    `;
  },

  admissionStatus: (student: Student): string => {
    const isApproved = student.status === 'approved';
    return `
      <div style=\"font-family: Arial, sans-serif; padding: 20px;\">
        <h2>Admission ${isApproved ? 'Approved' : 'Rejected'}</h2>
        <p>Dear ${student.fathersNames || student.mothersNames || 'Parent'},</p>
        <p>The admission status for <strong>${student.firstName} ${student.lastName}</strong> has been updated to <strong>${(student.status ?? '').toUpperCase()}</strong>.</p>
        ${
          isApproved
            ? `<p>Please find the admission letter attached or contact the school for next steps.</p>`
            : `<p>We appreciate your interest and encourage you to apply again in the future.</p>`
        }
        <br/>
        <p>Best regards,<br/>${(student as any).school?.name || 'Admissions Team'}</p>
      </div>
    `;
  },

  babyeyiIssued: (student: Student): string => {
    return `
      <div style=\"font-family: Arial, sans-serif; padding: 20px;\">
        <h2>Admission Document Issued</h2>
        <p>Dear ${student.fathersNames || student.mothersNames || 'Parent'},</p>
        <p>We’re pleased to inform you that the official admission document for <strong>${student.firstName} ${student.lastName}</strong> has been issued.</p>
        <p>Please find the document attached. If you have any questions, feel free to contact the school.</p>
        <br/>
        <p>Best regards,<br/>${(student as any).school?.name || 'Admissions Team'}</p>
      </div>
    `;
  },
};