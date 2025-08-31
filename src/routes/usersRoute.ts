import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';


const router = Router();

//register and login with email and password
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Google OAuth
router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),AuthController.googleCallback);
router.get('/google/failure', (req, res) => res.send('Google authentication failed'));

//Logout 
router.post('/logout', authenticateJWT, AuthController.logout);

export default router;
