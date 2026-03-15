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

        const orders = await prisma.order.findMany({
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

        // Generate CSV Content
        const headers = [
            'Order Number',
            'Date',
            'Customer Name',
            'Email',
            'City',
            'Total Amount',
            'Status',
            'Items Count',
            'Products'
        ];

        const rows = orders.map(order => {
            const productNames = order.items.map(i => `${i.product.name} (x${i.quantity})`).join('; ');
            return [
                order.orderNumber,
                order.createdAt.toISOString().split('T')[0],
                `${order.firstName} ${order.lastName}`,
                order.email,
                order.city,
                order.total.toFixed(2),
                order.status,
                order.items.length,
                `"${productNames}"`
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=aethel_report_${startDate || 'all'}_to_${endDate || 'today'}.csv`
            }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
