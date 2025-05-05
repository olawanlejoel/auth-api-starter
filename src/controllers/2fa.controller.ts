import { Request, Response } from 'express';
import * as twoFactorService from '../services/2fa.service';

export const setup2FA = async (req: Request, res: Response) => {
	const userId = (req as any).userId;

	try {
		const { qrCode } = await twoFactorService.generate2FASetup(userId);
		res.json({ qrCode });
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};

export const confirm2FASetup = async (req: Request, res: Response) => {
	const userId = (req as any).userId;
	const { token } = req.body;

	try {
		await twoFactorService.verify2FASetup(userId, token);
		res.json({ message: '2FA setup complete' });
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};

export const complete2FALogin = async (req: Request, res: Response) => {
	const userId = (req as any).userId;
	const { token } = req.body;

	try {
		const { accessToken, refreshToken } = await twoFactorService.verify2FALogin(
			userId,
			token
		);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.json({ accessToken });
	} catch (err: any) {
		res.status(401).json({ error: err.message });
	}
};

export const disable2FAController = async (req: Request, res: Response) => {
	const userId = (req as any).userId;

	try {
		await twoFactorService.disable2FA(userId);
		res.json({ message: '2FA disabled' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
};
