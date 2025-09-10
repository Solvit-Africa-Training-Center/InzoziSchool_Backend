// routes/school.routes.ts
import { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware';
import { ValidationMiddleware } from '../middlewares/validationMiddleware';
import { SchoolRegisterSchema, RejectSchoolSchema } from '../schema/school';
import * as SchoolController from '../controllers/schoolController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * /api/schools/register:
 *   post:
 *     summary: Register a new school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SchoolRegisterRequest'
 *     responses:
 *       201:
 *         description: School registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponse'
 */
router.post(
  '/schools/register',
  authMiddleware,
  checkRole(['SchoolManager']),
  upload.single('licenseDocument'),
  ValidationMiddleware({ type: 'body', schema: SchoolRegisterSchema }),
  SchoolController.registerSchool
);

/**
 * @swagger
 * /api/schools/approve/{schoolId}:
 *   patch:
 *     summary: Approve a school (Admin only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: School approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponse'
 */
router.patch(
  '/schools/approve/:schoolId',
  authMiddleware,
  checkRole(['Admin']),
  SchoolController.approveSchool
);

/**
 * @swagger
 * /api/schools/reject/{schoolId}:
 *   patch:
 *     summary: Reject a school (Admin only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectSchoolRequest'
 *     responses:
 *       200:
 *         description: School rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponse'
 */
router.patch(
  '/schools/reject/:schoolId',
  authMiddleware,
  checkRole(['Admin']),
  ValidationMiddleware({ type: 'body', schema: RejectSchoolSchema }),
  SchoolController.rejectSchool
);

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: List all schools, optionally filtered by status
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: List of schools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolResponse'
 */
router.get(
  '/schools',
  authMiddleware,
  checkRole(['Admin']),
  SchoolController.listSchools
);

/**
 * @swagger
 * /api/schools/pending:
 *   get:
 *     summary: List pending schools
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending schools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolResponse'
 */
router.get(
  '/schools/pending',
  authMiddleware,
  checkRole(['Admin']),
  SchoolController.listPendingSchools
);

/**
 * @swagger
 * /api/schools/approved:
 *   get:
 *     summary: List approved schools
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved schools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolResponse'
 */
router.get(
  '/schools/approved',
  authMiddleware,
  checkRole(['Admin']),
  SchoolController.listApprovedSchools
);

/**
 * @swagger
 * /api/schools/rejected:
 *   get:
 *     summary: List rejected schools
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rejected schools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SchoolResponse'
 */
router.get(
  '/schools/rejected',
  authMiddleware,
  checkRole(['Admin']),
  SchoolController.listRejectedSchools
);

/**
 * @swagger
 * /api/schools/{schoolId}:
 *   get:
 *     summary: Get school details by ID
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: School details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponse'
 */
router.get(
  '/schools/:schoolId',
  authMiddleware,
  checkRole(['Admin', 'SchoolManager']),
  SchoolController.getSchoolDetails
);

/**
 * @swagger
 * /api/resubmit/{schoolId}:
 *   patch:
 *     summary: Resubmit rejected school (SchoolManager only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ResubmitSchoolRequest'
 *     responses:
 *       200:
 *         description: School resubmitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolResponse'
 */
router.patch(
  '/resubmit/:schoolId',
  authMiddleware,
  checkRole(['SchoolManager']),
  upload.single('licenseDocument'),
  SchoolController.resubmitSchool
);

export default router;
