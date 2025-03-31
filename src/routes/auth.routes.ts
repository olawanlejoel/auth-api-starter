import { Router } from 'express';
import {
	signup,
	login,
	logout,
	refreshToken,
	forgotPassword,
	resetPassword,
} from '../controllers/auth.controller';

import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/protected', requireAuth, (req, res) => {
	res.json({
		status: 'success',
		message: 'You accessed a protected route',
		data: { user: (req as any).user },
	});
});

export default router;
