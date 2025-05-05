import prisma from '../prisma/client';
import { hashPassword, comparePasswords } from '../utils/hash';
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
	generateResetToken,
	signTemp2FAToken,
} from '../utils/token';

export const signup = async (name: string, email: string, password: string) => {
	if (!email || !password) throw new Error('Email and password required');

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new Error('Email already in use');

	const hashed = await hashPassword(password);
	const user = await prisma.user.create({
		data: { name, email, password: hashed },
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

	if (user.twoFactorEnabled) {
		const tempToken = signTemp2FAToken(user.id);
		return { requires2FA: true, tempToken };
	}

	const accessToken = generateAccessToken(user.id);
	const refreshToken = generateRefreshToken(user.id);

	return { accessToken, refreshToken };
};

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
		`🔗 Password reset link: http://localhost:3001/reset-password?token=${token}`
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

export const getCurrentUser = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			twoFactorEnabled: true,
		},
	});

	if (!user) throw new Error('User not found');
	return user;
};
