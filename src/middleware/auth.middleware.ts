import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';

interface AuthedRequest extends Request {
	userId?: string;
}

export const requireAuth = (
	req: AuthedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1];
	console.log(token);

	if (!token) {
		res.status(401).json({ error: 'Access token required' });
		return;
	}

	try {
		const payload = verifyAccessToken(token);
		req.userId = payload.userId;
		next();
	} catch (err) {
		res.status(401).json({ error: 'Invalid or expired token' });
	}
};
