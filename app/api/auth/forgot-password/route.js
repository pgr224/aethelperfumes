import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
            message: 'If an account with that email exists, a password reset code has been sent.'
        });

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            return successResponse;
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Hash the OTP before storing
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Store hashed OTP with 15-minute expiry
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: { email: user.email },
            data: {
                resetToken: hashedOtp,
                resetTokenExpiry: expiry,
            }
        });

        // Send OTP email
        try {
            await sendPasswordResetEmail(user.email, otp);
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
