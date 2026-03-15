import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // 1. Heatmap Data: Group successful referrals by city of the referee (from their orders)
        // Since Referral model doesn't have city, we look at completed orders of referees
        const referrals = await prisma.referral.findMany({
            where: { status: 'COMPLETED' },
            include: {
                referee: {
                    include: {
                        orders: {
                            where: { status: 'completed' },
                            take: 1,
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        const cityGroups = {};
        referrals.forEach(ref => {
            const city = ref.referee.orders[0]?.city || 'Unknown';
            cityGroups[city] = (cityGroups[city] || 0) + 1;
        });

        const heatmap = Object.entries(cityGroups)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count);

        // 2. User Stats for Management
        const users = await prisma.user.findMany({
            where: { role: 'customer' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                referralCode: true,
                referralTier: true,
                referralBalance: true,
                _count: {
                    select: { referralsGiven: { where: { status: 'COMPLETED' } } }
                }
            },
            orderBy: { referralBalance: 'desc' }
        });

        return NextResponse.json({
            heatmap,
            users: users.map(u => ({
                ...u,
                referralCount: u._count.referralsGiven
            }))
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId, tier } = await request.json();
        
        if (!['BRONZE', 'SILVER', 'GOLD'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { referralTier: tier }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
