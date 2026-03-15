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
        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, slug, description, image } = body;

        const category = await prisma.category.create({
            data: { name, slug, description, image }
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
