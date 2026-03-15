import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { id: 'asc' }
        });
        
        // Transform the response to match the frontend expectations
        const formatted = categories.map(cat => ({
            ...cat,
            productCount: cat._count.products
        }));

        return NextResponse.json({ categories: formatted });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
