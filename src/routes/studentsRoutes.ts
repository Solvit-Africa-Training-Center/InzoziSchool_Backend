import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { studentUpload } from '../middlewares/cloudinaryMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Endpoints for student registration and management
 */

/**
 * @swagger
 * /student:
 *   post:
 *     summary: Register a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - gender
 *               - DOB
 *               - fathersNames
 *               - mothersNames
 *               - representerEmail
 *               - representerPhone
 *               - nationality
 *               - province
 *               - district
 *               - sector
 *               - cell
 *               - village
 *               - studentType
 *               - passportPhoto
 *               - schoolId
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               DOB:
 *                 type: string
 *                 format: date
 *               fathersNames:
 *                 type: string
 *               mothersNames:
 *                 type: string
 *               representerEmail:
 *                 type: string
 *                 format: email
 *               representerPhone:
 *                 type: string
 *               nationality:
 *                 type: string
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *               sector:
 *                 type: string
 *               cell:
 *                 type: string
 *               village:
 *                 type: string
 *               studentType:
 *                 type: string
 *                 enum: [newcomer, ongoing]
 *               schoolId:
 *                 type: string
 *               indexNumber:
 *                 type: string
 *               passportPhoto:
 *                 type: string
 *                 format: binary
 *               resultSlip:
 *                 type: string
 *                 format: binary
 *               previousReport:
 *                 type: string
 *                 format: binary
 *               mitationLetter:
 *                 type: string
 *                 format: binary
 *           encoding:
 *             passportPhoto:
 *               contentType: image/jpeg
 *             resultSlip:
 *               contentType: application/pdf
 *             previousReport:
 *               contentType: application/pdf
 *             mitationLetter:
 *               contentType: application/pdf
 *     responses:
 *       '201':
 *         description: Student registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 studentId:
 *                   type: string
 *             example:
 *               success: true
 *               message: Student registered successfully
 *               studentId: "stu_12345"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Missing required fields: firstName, passportPhoto"
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to register student"
 */
router.post('/', studentUpload, StudentController.createStudent);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             example:
 *               - id: "stu_12345"
 *                 firstName: John
 *                 lastName: Doe
 *                 gender: Male
 *                 DOB: "2010-05-12"
 *                 status: approved
 *               - id: "stu_67890"
 *                 firstName: Jane
 *                 lastName: Smith
 *                 gender: Female
 *                 DOB: "2011-03-22"
 *                 status: pending
 *       403: { description: Unauthorized }
 */
router.get('/student', authMiddleware, StudentController.getAllStudents);

/**
 * @swagger
 * /student/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Student found
 *         content:
 *           application/json:
 *             example:
 *               id: "stu_12345"
 *               firstName: John
 *               lastName: Doe
 *               gender: Male
 *               DOB: "2010-05-12"
 *               nationality: Rwandan
 *               status: approved
 *       403: { description: Unauthorized }
 *       404: { description: Student not found }
 */
router.get('/student/:id', authMiddleware, StudentController.getStudentById);

/**
 * @swagger
 * /student/{id}/status:
 *   patch:
 *     summary: Update student status
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *           examples:
 *             sample:
 *               value: { status: approved }
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             example: { id: "stu_12345", status: approved }
 *       403: { description: Unauthorized }
 *       404: { description: Student not found }
 */
router.patch('/student/:id/status', authMiddleware, StudentController.updateStudentStatus);

/**
 * @swagger
 * /student/{id}/babyeyi:
 *   post:
 *     summary: Issue Babyeyi document
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *           encoding:
 *             file: { contentType: application/pdf }
 *     responses:
 *       200:
 *         description: Babyeyi document issued
 *         content:
 *           application/json:
 *             example:
 *               studentId: "stu_12345"
 *               fileUrl: "https://cloudinary.com/myfile.pdf"
 *               message: "Babyeyi document issued successfully"
 *       400: { description: Validation error }
 *       403: { description: Unauthorized }
 */
router.post('/student/:id/babyeyi', authMiddleware, studentUpload, StudentController.issueBabyeyiDocument);

export default router;
