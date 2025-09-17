// routes/school.routes.ts
import { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware';
import { ValidationMiddleware } from '../middlewares/validationMiddleware';
import { SchoolRegisterSchema, RejectSchoolSchema,CreateSchoolGallerySchema,CreateSchoolSpotSchema,updateSchoolInfoSchema,UpdateSchoolProfileSchema} from '../schema/school';
import * as SchoolController from '../controllers/schoolController';
import * as SchoolEntitiesController from  '../controllers/schoolEntitiesController'
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
router.get('/schools/rejected',authMiddleware,checkRole(['Admin']),SchoolController.listRejectedSchools);
  

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
router.get('/schools/:schoolId', authMiddleware,checkRole(['Admin', 'SchoolManager']),SchoolController.getSchoolDetails);
        
 
  
  /**
 * @swagger
 * /api/schools/{schoolId}:
 *   put:
 *     summary: Update school information (SchoolManager only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the school to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolInfoSchema'
 *     responses:
 *       200:
 *         description: School information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "School information updated successfully"
 *                 data:
 *                   type: object
 *                   description: Updated school object
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a SchoolManager)
 *       404:
 *         description: School not found
 */
router.put(
  '/schools/:schoolId',
  authMiddleware,
  checkRole(['SchoolManager']),
  ValidationMiddleware({ type: 'body', schema: updateSchoolInfoSchema }),
  SchoolEntitiesController.updateSchoolInfo
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

/**
 * @swagger
 * /api/schools/{schoolId}/profile:
 *   get:
 *     summary: Get school profile
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateSchoolProfileSchema'
 */
router.get('/:schoolId/profile', authMiddleware, SchoolEntitiesController.getProfile);

/**
 * @swagger
 * /api/schools/{schoolId}:
 *   delete:
 *     summary: Delete a school (Admin only)
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
 *         description: School deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School deleted successfully
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not an Admin)
 *       404:
 *         description: School not found
 */
router.delete(
  '/schools/:schoolId',
  authMiddleware,
  checkRole(['Admin']),
  SchoolController.deleteSchool
);


/**
 * @swagger
 * /api/schools/{schoolId}/profile:
 *   put:
 *     summary: Update school profile (SchoolManager only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolProfileSchema'
 *     responses:
 *       200:
 *         description: School profile updated successfully
 */
router.put(
  '/schools/:schoolId/profile',
  authMiddleware,
  checkRole(['SchoolManager']),
  upload.single('profilePhoto'),
  ValidationMiddleware({ type: 'body', schema: UpdateSchoolProfileSchema }),
  SchoolEntitiesController.updateProfile
);

/**
 * @swagger
 * /api/schools/{schoolId}/spots:
 *   post:
 *     summary: Create a new school spot (SchoolManager or AdmissionManager)
 *     tags: [School Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolSpotSchema'
 *     responses:
 *       201:
 *         description: School spot created successfully
 */
router.post(
  '/schools/:schoolId/spots',
  authMiddleware,
  checkRole(['SchoolManager', 'AdmissionManager']),
  ValidationMiddleware({ type: 'body', schema: CreateSchoolSpotSchema }),
  SchoolEntitiesController.createSpot
);

/**
 * @swagger
 * /api/schools/{schoolId}/spots/{id}:
 *   put:
 *     summary: Update a school spot (SchoolManager or AdmissionManager)
 *     tags: [School Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolSpotSchema'
 *     responses:
 *       200:
 *         description: School spot updated successfully
 */
router.put(
  '/schools/:schoolId/spots/:id',
  authMiddleware,
  checkRole(['SchoolManager', 'AdmissionManager']),
  SchoolEntitiesController.updateSpot
);

/**
 * @swagger
 * /api/schools/{schoolId}/spots:
 *   get:
 *     summary: List all spots of a school
 *     tags: [School Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of school spots
 */
router.get('/schools/:schoolId/spots', authMiddleware, SchoolEntitiesController.listSpots);
/**
 * @swagger
 * /api/schools/{schoolId}/spots/{id}:
 *   delete:
 *     summary: Delete a school spot (SchoolManager or AdmissionManager)
 *     tags: [School Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: School spot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: School spot deleted successfully
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 */
router.delete(
  '/schools/:schoolId/spots/:id',
  authMiddleware,
  checkRole(['SchoolManager', 'AdmissionManager']),
  SchoolEntitiesController.deleteSchoolSpot
);


/**
 * @swagger
 * /api/schools/{schoolId}/gallery:
 *   post:
 *     summary: Add images to school gallery (SchoolManager only)
 *     tags: [School Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolGallerySchema'
 *     responses:
 *       201:
 *         description: Gallery item created successfully
 */
router.post(
  '/schools/:schoolId/gallery',
  authMiddleware,
  checkRole(['SchoolManager']),
  upload.single('imageUrl'),
  ValidationMiddleware({ type: 'body', schema: CreateSchoolGallerySchema }),
  SchoolEntitiesController.addGallery
);

/**
 * @swagger
 * /api/schools/{schoolId}/gallery:
 *   get:
 *     summary: List all gallery items of a school
 *     tags: [School Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the school
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [classroom, computerLab, library, sports, dining, dormitory, administration, playground]
 *         description: Filter gallery by category
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of gallery items
 */
router.get(
  '/schools/:schoolId/gallery',
  authMiddleware,
  SchoolEntitiesController.listGallery
);


/**
 * @swagger
 * /api/schools/{schoolId}/gallery/{id}:
 *   put:
 *     summary: Update a gallery item (SchoolManager only)
 *     tags: [School Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolGallerySchema'
 *     responses:
 *       200:
 *         description: Gallery item updated successfully
 */
router.put(
  '/schools/:schoolId/gallery/:id',
  authMiddleware,
  checkRole(['SchoolManager']),
  upload.single('imageUrl'),
  SchoolEntitiesController.updateGallery
);



/**
 * @swagger
 * /api/schools/{schoolId}/gallery/{id}:
 *   delete:
 *     summary: Delete a gallery item (SchoolManager only)
 *     tags: [School Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gallery item deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Gallery item not found
 */
router.delete(
  '/schools/:schoolId/gallery/:id',
  authMiddleware,
  checkRole(['SchoolManager']),
  SchoolEntitiesController.deleteGallery
);


router.get('/schools/search',  SchoolController.SchoolSearch);

export default router;