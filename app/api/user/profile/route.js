import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                referralsGiven: {
                    include: {
                        referee: {
                            select: { firstName: true, createdAt: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Remove password
        const { password: _, ...safeProfile } = profile;

        return NextResponse.json({ profile: safeProfile });
    } catch (error) {
        console.error('Profile Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
