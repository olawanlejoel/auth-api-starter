import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import prisma from '../prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/token';

export const generate2FASetup = async (userId: string) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) throw new Error('User not found');

	const secret = authenticator.generateSecret(); // generate a base32 TOTP secret
	const otpauth = authenticator.keyuri(user.email, 'Code With Joel', secret); // otpauth:// URL format
	const qrCode = await qrcode.toDataURL(otpauth); // convert otpauth to base64 QR image

	await prisma.user.update({
		where: { id: userId },
		data: {
			tempTwoFactorSecret: secret, // not the final field used for login
			twoFactorEnabled: false,
		},
	});

	return { qrCode };
};

export const verify2FASetup = async (userId: string, token: string) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user?.tempTwoFactorSecret) throw new Error('2FA not enabled');

	const secret = user.tempTwoFactorSecret;

	const isValid = authenticator.verify({ token, secret });

	if (!isValid) {
		throw new Error('Invalid 2FA token');
	}

	await prisma.user.update({
		where: { id: userId },
		data: {
			twoFactorEnabled: true,
			twoFactorSecret: secret,
			tempTwoFactorSecret: null,
		},
	});

	return true;
};

export const verify2FALogin = async (userId: string, token: string) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user?.twoFactorSecret) throw new Error('2FA not enabled');

	const isValid = authenticator.verify({
		token,
		secret: user.twoFactorSecret,
	});

	if (!isValid) throw new Error('Invalid 2FA code');

	const accessToken = generateAccessToken(user.id);
	const refreshToken = generateRefreshToken(user.id);

	return { accessToken, refreshToken };
};

export const disable2FA = async (userId: string) => {
	await prisma.user.update({
		where: { id: userId },
		data: {
			twoFactorEnabled: false,
			twoFactorSecret: null,
		},
	});

	return true;
};
