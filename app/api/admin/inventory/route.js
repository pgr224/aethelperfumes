import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                stock: true,
                price: true,
                salePrice: true,
                images: true,
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                stock: 'asc'
            }
        });

        // Parse images if they are stored as JSON string
        const formattedProducts = products.map(p => {
            let parsedImages = [];
            try {
                parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
            } catch (e) {
                parsedImages = [];
            }
            return {
                ...p,
                images: parsedImages
            };
        });

        return NextResponse.json({ products: formattedProducts });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { id, stock } = await request.json();

        if (!id || stock === undefined) {
            return NextResponse.json({ error: 'Missing ID or stock value' }, { status: 400 });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { stock: parseInt(stock) }
        });

        return NextResponse.json({ success: true, product: updatedProduct });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
