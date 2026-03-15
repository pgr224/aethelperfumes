import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const promotions = await prisma.promotion.findMany({
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json({ promotions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, discountPercentage, categoryId, startDate, endDate, bannerTitle, bannerSubtitle, bannerImage } = body;

        const promotion = await prisma.promotion.create({
            data: {
                name,
                description,
                discountPercentage: parseFloat(discountPercentage),
                categoryId: categoryId ? parseInt(categoryId) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                bannerTitle,
                bannerSubtitle,
                bannerImage,
                status: 'scheduled'
            }
        });

        return NextResponse.json({ promotion });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
