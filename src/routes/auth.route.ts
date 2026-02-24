import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res, next) => authController.register(req, res, next));

// POST /api/auth/login
router.post('/login', (req, res, next) => authController.login(req, res, next));

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));

// POST /api/auth/verify-reset-otp
router.post('/verify-reset-otp', (req, res, next) => authController.verifyResetOtp(req, res, next));

// POST /api/auth/reset-password
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

// PUT /api/auth/me
router.put('/me', authMiddleware, (req, res, next) => authController.updateMe(req, res, next));

// POST /api/auth/avatar
router.post(
	'/avatar',
	authMiddleware,
	upload.single('avatar'),
	(req, res, next) => authController.uploadAvatar(req, res, next)
);

// DELETE /api/auth/avatar
router.delete('/avatar', authMiddleware, (req, res, next) => authController.deleteAvatar(req, res, next));

export default router;
