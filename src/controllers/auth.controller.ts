import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const { accessToken, refreshToken } = await AuthService.signup(
			email,
			password
		);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({ accessToken });
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const { accessToken, refreshToken } = await AuthService.login(
			email,
			password
		);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.json({ accessToken });
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};

export const logout = async (_req: Request, res: Response) => {
	try {
		// Clear the refresh token cookie
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		});

		res.json({ message: 'Logged out successfully' });
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	try {
		const token = req.cookies.refreshToken;

		const { accessToken, refreshToken } = AuthService.refreshToken(token);

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

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const token = await AuthService.forgotPassword(email);

		// For now, just return token so you can test
		res.json({
			message: 'If the user exists, a reset link has been sent.',
			token,
		});
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body;
		await AuthService.resetPassword(token, newPassword);
		res.json({ message: 'Password reset successful' });
	} catch (err: any) {
		res.status(400).json({ error: err.message });
	}
};
