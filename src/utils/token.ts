import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (userId: string) => {
	return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '15m',
	});
};

export const generateRefreshToken = (userId: string) => {
	return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: '7d',
	});
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
		userId: string;
	};
};

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
		userId: string;
	};
};

export const signTemp2FAToken = (userId: string) => {
	return jwt.sign({ userId }, process.env.TEMP_2FA_TOKEN_SECRET!, {
		expiresIn: '5m',
	});
};

export const verifyTemp2FAToken = (token: string) => {
	return jwt.verify(token, process.env.TEMP_2FA_TOKEN_SECRET!) as {
		userId: string;
	};
};

export const generateResetToken = () => {
	const token = crypto.randomBytes(32).toString('hex');
	const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes from now
	return { token, expiry };
};
