import { Router } from 'express';
import router from './usersRoute';
import authRoutes from './usersRoute';

const routers = Router();


router.use( '/api/v1/auth', authRoutes )


// routers.use('/api/v1', ...allRoutes);

export { routers };
