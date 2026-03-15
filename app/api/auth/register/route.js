import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'aethel-secret-key-2026';

export async function POST(request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password, referralCode } = body;

        // Basic validation
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }

        let referredById = null;

        // Process referral code if provided
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode }
            });
            if (referrer) {
                referredById = referrer.id;
            }
        }

        // Generate unique referral code for the new user
        const newReferralCode = `AETHEL-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: 'customer',
                referralCode: newReferralCode,
                referredById,
                name: `${firstName} ${lastName}`, // For backwards compatibility
            }
        });

        // Create initial referral record if referred
        if (referredById) {
            const rewardSetting = await prisma.siteSetting.findUnique({
                where: { key: 'referralReward' }
            });
            const rewardAmount = rewardSetting ? parseFloat(rewardSetting.value) : 20.00;

            await prisma.referral.create({
                data: {
                    referrerId: referredById,
                    refereeId: user.id,
                    status: 'PENDING',
                    rewardAmount
                }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        const response = NextResponse.json({
            success: true,
            user: userWithoutPassword
        }, { status: 201 });

        // Set HttpOnly cookie
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
