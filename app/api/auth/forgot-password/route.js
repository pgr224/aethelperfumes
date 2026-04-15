import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Always return success to prevent email enumeration
        const successResponse = NextResponse.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            return successResponse;
        }

        // Generate a secure random token for the reset link
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Also generate 6-digit OTP as fallback
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Hash both the token and OTP before storing
        // Store them combined: token|otpHash
        const hashedToken = await bcrypt.hash(resetToken, 10);
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Store both hashes separated by pipe: tokenHash|otpHash
        const combinedHash = `${hashedToken}|${hashedOtp}`;

        // Store hashed token with 15-minute expiry
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: { email: user.email },
            data: {
                resetToken: combinedHash,
                resetTokenExpiry: expiry,
            }
        });

        // Build the reset URL from the request origin
        const origin = request.headers.get('origin')
            || request.headers.get('x-forwarded-host') && `https://${request.headers.get('x-forwarded-host')}`
            || request.headers.get('host') && `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
            || 'http://localhost:3000';

        const resetUrl = `${origin}/account/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

        // Send email with both link and OTP
        try {
            await sendPasswordResetEmail(user.email, otp, resetUrl);
        } catch (emailErr) {
            console.error('Failed to send reset email:', emailErr);
            return NextResponse.json({
                error: 'Failed to send reset email. Please contact support or try again later.'
            }, { status: 500 });
        }

        return successResponse;

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
