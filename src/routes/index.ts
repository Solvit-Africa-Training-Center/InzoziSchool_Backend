import { Router } from 'express';
import authRoutes from './authRoutes';

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

const allRoutes: Router[] = [authRoutes];

export { routers };
