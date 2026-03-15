import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const posts = await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ posts });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, slug, excerpt, content, image, author, id } = body;

        const postData = {
            title,
            slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            excerpt,
            content,
            image,
            author: author || "Editorial Team"
        };

        let post;
        if (id) {
            post = await prisma.blogPost.update({
                where: { id },
                data: postData
            });
        } else {
            post = await prisma.blogPost.create({
                data: postData
            });
        }

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error('Blog API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id'));
        await prisma.blogPost.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
