import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json({ slides });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const body = await request.json();
        const slide = await prisma.heroSlide.create({
            data: {
                title: body.title,
                subtitle: body.subtitle,
                description: body.description,
                ctaText: body.ctaText || 'Shop Now',
                ctaLink: body.ctaLink || '/products',
                image: body.image,
                sortOrder: body.sortOrder || 0,
            },
        });
        return NextResponse.json({ slide });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
