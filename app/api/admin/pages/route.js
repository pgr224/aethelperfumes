import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const pages = await prisma.staticPage.findMany();
        return NextResponse.json({ pages });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const page = await prisma.staticPage.upsert({
            where: { slug: body.slug },
            update: {
                title: body.title,
                content: body.content
            },
            create: {
                title: body.title,
                slug: body.slug,
                content: body.content
            }
        });
        return NextResponse.json({ page });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
