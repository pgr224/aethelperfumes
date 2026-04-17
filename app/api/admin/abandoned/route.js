import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getJwtSecret } from '@/lib/jwt-secret';

async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, getJwtSecret());
        if (decoded.role !== 'admin' && decoded.role !== 'manager') return null;
        return decoded;
    } catch {
        return null;
    }
}

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

// DELETE /api/admin/abandoned
// Body: { sessionId: string } → clear a single session's cart
// Body: {}                    → clear ALL cart items (all sessions)
export async function DELETE(request) {
    try {
        const adminUser = await getAdminUser();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { sessionId } = body;

        let deleted;
        if (sessionId) {
            // Clear a single session's cart
            deleted = await prisma.cartItem.deleteMany({
                where: { sessionId }
            });
            return NextResponse.json({
                message: `Cart for session ...${sessionId.slice(-8)} cleared successfully.`,
                deletedCount: deleted.count
            });
        } else {
            // Clear ALL cart items across every session
            deleted = await prisma.cartItem.deleteMany({});
            return NextResponse.json({
                message: `All carts cleared. ${deleted.count} item(s) removed from the database.`,
                deletedCount: deleted.count
            });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

