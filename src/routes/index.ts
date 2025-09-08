import { Router } from 'express';
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'

const routers = Router();
const allRoutes = [authRoutes,userRoutes];
routers.use("/api", ...allRoutes);

export { routers };