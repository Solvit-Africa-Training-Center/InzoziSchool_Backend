// src/routes/routers.ts
import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import schoolRoutes from './schoolRoutes';
import studentRoutes from './studentsRoutes'; // ✅ add student routes

const routers = Router();

// Mount all routes under /api
routers.use('/api/auth', authRoutes);
routers.use('/api/users', userRoutes);
routers.use('/api/schools', schoolRoutes);
routers.use('/api/students', studentRoutes); // ✅ mount student routes here

export { routers };
