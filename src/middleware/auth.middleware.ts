import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyTemp2FAToken } from '../utils/token';

// Shared type-safe interface for both
export interface AuthedRequest extends Request {
	userId?: string;
}

// 🔒 For regular authenticated users (after full login)
export const requireAuth = (
	req: AuthedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Missing access token' });
		return;
	}

	const token = authHeader.split(' ')[1];

	try {
		const payload = verifyAccessToken(token);
		req.userId = payload.userId;
		next();
	} catch {
		res.status(401).json({ error: 'Invalid or expired access token' });
	}
};

// 🔑 For users in 2FA flow (temp token after password login)
export const requireTempToken = (
	req: AuthedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Missing temp token' });
		return;
	}

	const token = authHeader.split(' ')[1];

	try {
		const payload = verifyTemp2FAToken(token);
		req.userId = payload.userId;
		next();
	} catch {
		res.status(401).json({ error: 'Invalid or expired temp token' });
	}
};
