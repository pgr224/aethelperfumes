import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const posts = await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ posts });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
