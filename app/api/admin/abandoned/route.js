import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const settings = await prisma.siteSetting.findMany();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // Thresholds in hours
        const orderHours = parseInt(settingsMap.orderAbandonedHours || '2');
        const cartHours = parseInt(settingsMap.cartAbandonedHours || '4');

        const orderThreshold = new Date(Date.now() - orderHours * 60 * 60 * 1000);
        
        const abandonedOrders = await prisma.order.findMany({
            where: {
                status: 'pending',
                createdAt: {
                    lte: orderThreshold
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate potential lost revenue
        const lostRevenue = abandonedOrders.reduce((acc, order) => acc + order.total, 0);

        // Stale Carts (Items sitting in carts for more than configured hours)
        const cartThreshold = new Date(Date.now() - cartHours * 60 * 60 * 1000);
        const staleCartItems = await prisma.cartItem.findMany({
            where: {
                createdAt: {
                    lte: cartThreshold
                }
            },
            include: {
                product: true
            }
        });

        // Group stale cart items by sessionId
        const cartGroups = staleCartItems.reduce((acc, item) => {
            if (!acc[item.sessionId]) {
                acc[item.sessionId] = {
                    sessionId: item.sessionId,
                    items: [],
                    total: 0,
                    lastActivity: item.createdAt
                };
            }
            acc[item.sessionId].items.push(item);
            acc[item.sessionId].total += (item.product.price * item.quantity);
            if (item.createdAt > acc[item.sessionId].lastActivity) {
                acc[item.sessionId].lastActivity = item.createdAt;
            }
            return acc;
        }, {});

        const staleCarts = Object.values(cartGroups);

        return NextResponse.json({ 
            abandonedOrders, 
            staleCarts,
            settings: settingsMap,
            stats: {
                abandonedCount: abandonedOrders.length,
                staleCartCount: staleCarts.length,
                lostRevenueRevenue: lostRevenue
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
