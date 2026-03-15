import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let whereClause = {};
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt.gte = new Date(startDate);
            if (endDate) {
                const ed = new Date(endDate);
                ed.setHours(23, 59, 59, 999);
                whereClause.createdAt.lte = ed;
            }
        }

        const [orderCount, productCount, totalRevenue, pendingOrders, lowStockCount] = await Promise.all([
            prisma.order.count({ where: whereClause }),
            prisma.product.count(),
            prisma.order.aggregate({
                where: whereClause,
                _sum: { total: true }
            }),
            prisma.order.count({
                where: { ...whereClause, status: 'pending' }
            }),
            prisma.product.count({
                where: { stock: { lt: 10 } }
            })
        ]);

        // Calculate revenue by day for the requested range (simplified for SQLite)
        const allOrders = await prisma.order.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const revenueData = allOrders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + order.total;
            return acc;
        }, {});

        // Product Performance Heatmap Data
        const productStats = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const pid = item.productId;
                if (!productStats[pid]) {
                    productStats[pid] = {
                        id: pid,
                        name: item.product.name,
                        revenue: 0,
                        units: 0,
                        image: JSON.parse(item.product.images)[0]
                    };
                }
                productStats[pid].revenue += (item.price * item.quantity);
                productStats[pid].units += item.quantity;
            });
        });

        const topProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            stats: {
                orderCount,
                productCount,
                totalRevenue: totalRevenue._sum.total || 0,
                pendingOrders,
                lowStockCount
            },
            recentOrders: allOrders.slice(0, 5),
            revenueData,
            topProducts
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
