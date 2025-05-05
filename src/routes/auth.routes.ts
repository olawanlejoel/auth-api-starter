import { Router } from 'express';
import {
	signup,
	login,
	logout,
	refreshToken,
	forgotPassword,
	resetPassword,
	getMe,
} from '../controllers/auth.controller';

import {
	setup2FA,
	confirm2FASetup,
	complete2FALogin,
	disable2FAController,
} from '../controllers/2fa.controller';

import { requireAuth, requireTempToken } from '../middleware/auth.middleware';

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
router.get('/me', requireAuth, getMe);

router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/verify-setup', requireAuth, confirm2FASetup);
router.post('/2fa/login', requireTempToken, complete2FALogin);
router.post('/2fa/disable', requireAuth, disable2FAController);

export default router;
