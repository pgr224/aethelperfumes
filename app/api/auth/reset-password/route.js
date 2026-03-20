import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 });
        }

        // Check expiry
        if (new Date(user.resetTokenExpiry) < new Date()) {
            // Clear expired token
            await prisma.user.update({
                where: { email: user.email },
                data: { resetToken: null, resetTokenExpiry: null }
            });
            return NextResponse.json({ error: 'Reset code has expired. Please request a new one.' }, { status: 400 });
        }

        // Verify OTP
        const isValidOtp = await bcrypt.compare(otp, user.resetToken);

        if (!isValidOtp) {
            return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset fields
        await prisma.user.update({
            where: { email: user.email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
