import { Router } from 'express';
import { UserManagementController } from '../controllers/userManagementController';
import { authenticate } from '../middlewares/authMiddleware';
import { ValidationMiddleware } from '../middlewares/validationMiddleware';
import { 
  checkUserManagementPermission, 
  validateManagedUser, 
  validateCreateUserRole 
} from '../middlewares/roleHierarchyMiddleware';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  getUsersQuerySchema
} from '../utils/validationSchemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: InzoziSchool user management endpoints with role hierarchy (SYSTEM_ADMIN manages INSPECTORs, SCHOOL_MANAGER manages ADMISSION_MANAGERs)
 */

/**
 * @swagger
 * /api/user-management/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - gender
 *               - province
 *               - district
 *               - sector
 *               - cell
 *               - village
 *               - phone
 *               - email
 *               - roleId
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
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
 *               phone:
 *                 type: string
 *                 pattern: '^(\+?25)?(07[0-9]{8})$'
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Optional - if not provided, system generates temporary password
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     temporaryPassword:
 *                       type: string
 *                       description: Only returned if password was not provided
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: User with email already exists
 */
router.post('/users',
  authenticate,
  checkUserManagementPermission('create'),
  ValidationMiddleware({ type: 'body', schema: createUserSchema }),
  validateCreateUserRole,
  UserManagementController.createUser
);

/**
 * @swagger
 * /api/user-management/users:
 *   get:
 *     summary: Get users (filtered by role hierarchy and permissions)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [INSPECTOR, ADMISSION_MANAGER]
 *         description: Filter by specific role
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by school (for SYSTEM_ADMIN)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, or phone
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalUsers:
 *                           type: integer
 *                         usersPerPage:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 */
router.get('/users',
  authenticate,
  checkUserManagementPermission('read'),
  ValidationMiddleware({ type: 'query', schema: getUsersQuerySchema }),
  UserManagementController.getUsers
);

/**
 * @swagger
 * /api/user-management/users/stats:
 *   get:
 *     summary: Get user statistics for dashboard
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
router.get('/users/stats',
  authenticate,
  checkUserManagementPermission('read'),
  UserManagementController.getUserStats
);

/**
 * @swagger
 * /api/user-management/users/available-roles:
 *   get:
 *     summary: Get roles that current user can assign
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available roles retrieved successfully
 */
router.get('/users/available-roles',
  authenticate,
  checkUserManagementPermission('read'),
  UserManagementController.getAvailableRoles
);

/**
 * @swagger
 * /api/user-management/users/{userId}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get('/users/:userId',
  authenticate,
  checkUserManagementPermission('read'),
  ValidationMiddleware({ type: 'params', schema: userIdParamSchema }),
  validateManagedUser,
  UserManagementController.getUserById
);

/**
 * @swagger
 * /api/user-management/users/{userId}:
 *   put:
 *     summary: Update a user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
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
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 */
router.put('/users/:userId',
  authenticate,
  checkUserManagementPermission('update'),
  ValidationMiddleware({ type: 'params', schema: userIdParamSchema }),
  ValidationMiddleware({ type: 'body', schema: updateUserSchema }),
  validateManagedUser,
  UserManagementController.updateUser
);

/**
 * @swagger
 * /api/user-management/users/{userId}:
 *   delete:
 *     summary: Delete a user (soft delete)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId',
  authenticate,
  checkUserManagementPermission('delete'),
  ValidationMiddleware({ type: 'params', schema: userIdParamSchema }),
  validateManagedUser,
  UserManagementController.deleteUser
);

/**
 * @swagger
 * /api/user-management/users/{userId}/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     temporaryPassword:
 *                       type: string
 *                     message:
 *                       type: string
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.post('/users/:userId/reset-password',
  authenticate,
  checkUserManagementPermission('update'),
  ValidationMiddleware({ type: 'params', schema: userIdParamSchema }),
  validateManagedUser,
  UserManagementController.resetUserPassword
);

/**
 * @swagger
 * /api/user-management/users/bulk-action:
 *   post:
 *     summary: Perform bulk actions on users (future enhancement)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete, activate, deactivate]
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       501:
 *         description: Not implemented yet
 */
router.post('/users/bulk-action',
  authenticate,
  checkUserManagementPermission('update'),
  UserManagementController.bulkAction
);

export default router;
