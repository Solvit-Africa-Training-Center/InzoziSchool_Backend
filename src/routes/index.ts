import { Router } from 'express';
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import schoolRoutes from './schoolRoutes'

const routers = Router();
const allRoutes = [authRoutes,userRoutes,schoolRoutes];
routers.use("/api", ...allRoutes);

export { routers };