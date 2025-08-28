import { Router } from 'express';

const routers = Router();


const allRoutes: Router[] = [];


routers.use('/api/v1', ...allRoutes);

export { routers };
