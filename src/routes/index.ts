import { Router } from 'express';
import authRoutes from './authRoutes';
import userManagementRoutes from './userManagementRoutes';

const routers = Router();

/**
 * @swagger
 * tags:
 *   name: General
 *   description: General API endpoints
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Basic health check endpoint to verify API is running
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hello World
 */

// Authentication routes
routers.use('/auth', authRoutes);

// User Management routes (SYSTEM_ADMIN manages INSPECTORs, SCHOOL_MANAGER manages ADMISSION_MANAGERs)
routers.use('/user-management', userManagementRoutes);

const allRoutes: Router[] = [authRoutes, userManagementRoutes];

export { routers };
