import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                referralCode: true,
                referralBalance: true,
                referralTier: true,
                refEmailNotifications: true,
                refWhatsAppNotifications: true,
                referralsGiven: {
                    include: {
                        referee: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                createdAt: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return NextResponse.json({
            referralCode: userData.referralCode,
            balance: userData.referralBalance,
            tier: userData.referralTier,
            emailNotifications: userData.refEmailNotifications,
            whatsappNotifications: userData.refWhatsAppNotifications,
            referrals: userData.referralsGiven
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
