// src/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { ValidationMiddleware } from "../middlewares/validationMiddleware";
import { 
  createSchoolManagerSchema, 
  createAdmissionManagerSchema, 
  updateUserSchema 
} from "../schema/userSchema";

const router = Router();

/** 
 * @swagger
 * /api/users/school-manager:
 *   post:
 *     summary: Register a new School Manager
 *     tags: [User Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolManagerRequest'
 *     responses:
 *       201:
 *         description: School Manager registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSchoolManagerResponse'
 */
router.post(
  '/users/school-manager',
  ValidationMiddleware({ type: 'body', schema: createSchoolManagerSchema }),
  UserController.registerSchoolManager
);

/**
 * @swagger
 * /api/users/admission-manager:
 *   post:
 *     summary: Create a new Admission Manager (SchoolManager only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdmissionManagerRequest'
 *     responses:
 *       201:
 *         description: Admission Manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateAdmissionManagerResponse'
 */
router.post(
  '/admission-manager',
  authMiddleware,
  checkRole(['SchoolManager']),
  ValidationMiddleware({ type: 'body', schema: createAdmissionManagerSchema }),
  UserController.registerAdmissionManager
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin gets all, SchoolManager gets AdmissionManagers in their school)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUsersResponse'
 */
router.get(
  '/users',
  authMiddleware,
  checkRole(['Admin', 'SchoolManager']),
  UserController.getUsers
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete a user (Admin can delete any, SchoolManager can delete AdmissionManagers in their school)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete(
  '/users/:userId',
  authMiddleware,
  checkRole(['Admin', 'SchoolManager']),
  UserController.deleteUser
);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: "Update user information (Public: self update, Admin: any user, SchoolManager: AdmissionManagers in their school)"
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserResponse'
 */

router.put(
  '/users/:userId',
  authMiddleware,
  ValidationMiddleware({ type: 'body', schema: updateUserSchema }),
  UserController.updateUser 
);

export default router;
