import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { isActive: true },
            take: 3,
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ testimonials });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
