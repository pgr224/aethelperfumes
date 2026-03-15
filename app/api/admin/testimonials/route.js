import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ testimonials });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, content, role, rating, avatar } = body;

        if (!name || !content) {
            return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                content,
                role,
                rating: parseInt(rating) || 5,
                avatar,
                isActive: true
            }
        });

        return NextResponse.json({ success: true, testimonial });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
