import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const city = searchParams.get('city');
        const minTotal = searchParams.get('minTotal');
        const maxTotal = searchParams.get('maxTotal');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let where = {};

        if (search) {
            where.OR = [
                { orderNumber: { contains: search } },
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } }
            ];
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (city) {
            where.city = { contains: city };
        }

        if (minTotal || maxTotal) {
            where.total = {};
            if (minTotal) where.total.gte = parseFloat(minTotal);
            if (maxTotal) where.total.lte = parseFloat(maxTotal);
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) {
                const ed = new Date(endDate);
                ed.setHours(23, 59, 59, 999);
                where.createdAt.lte = ed;
            }
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
