import prisma from '../prisma/client';
import { hashPassword, comparePasswords } from '../utils/hash';
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
	generateResetToken,
} from '../utils/token';

export const signup = async (email: string, password: string) => {
	if (!email || !password) throw new Error('Email and password required');

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new Error('Email already in use');

	const hashed = await hashPassword(password);
	const user = await prisma.user.create({
		data: { email, password: hashed },
	});

	const accessToken = generateAccessToken(user.id);
	const refreshToken = generateRefreshToken(user.id);

	return { accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
	if (!email || !password) throw new Error('Email and password required');

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new Error('Invalid email or password');

	const valid = await comparePasswords(password, user.password);
	if (!valid) throw new Error('Invalid email or password');

	const accessToken = generateAccessToken(user.id);
	const refreshToken = generateRefreshToken(user.id);

	return { accessToken, refreshToken };
};

import jwt from 'jsonwebtoken';

export const refreshToken = (token: string) => {
	if (!token) throw new Error('No token provided');

	try {
		const payload = verifyRefreshToken(token);

		const newAccessToken = generateAccessToken(payload.userId);

		// Optional: rotate refresh token
		const newRefreshToken = generateRefreshToken(payload.userId);

		return { accessToken: newAccessToken, refreshToken: newRefreshToken };
	} catch (err) {
		throw new Error('Invalid or expired refresh token');
	}
};

export const forgotPassword = async (email: string) => {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return; // Don't reveal user existence

	const { token, expiry } = generateResetToken();

	await prisma.user.update({
		where: { email },
		data: {
			resetToken: token,
			resetTokenExp: expiry,
		},
	});

	// In real app: send email here
	console.log(
		`🔗 Password reset link: http://localhost:3000/reset-password?token=${token}`
	);
};

export const resetPassword = async (token: string, newPassword: string) => {
	const user = await prisma.user.findFirst({
		where: {
			resetToken: token,
			resetTokenExp: {
				gte: new Date(),
			},
		},
	});

	if (!user) throw new Error('Invalid or expired reset token');

	const hashed = await hashPassword(newPassword);

	await prisma.user.update({
		where: { id: user.id },
		data: {
			password: hashed,
			resetToken: null,
			resetTokenExp: null,
		},
	});
};
