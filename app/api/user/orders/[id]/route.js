import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { canCancelOrder } from '@/lib/cancellation';

export async function GET(request, { params }) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, images: true, slug: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership
        if (order.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check cancel eligibility
        const cancelEligibility = canCancelOrder(order);

        return NextResponse.json({ order, cancelEligibility });
    } catch (error) {
        console.error('Order Detail Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
