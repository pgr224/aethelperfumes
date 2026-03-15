import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Try to find by slug first, then by id
        let product;
        if (isNaN(id)) {
            product = await prisma.product.findUnique({
                where: { slug: id },
                include: { category: true },
            });
        } else {
            product = await prisma.product.findUnique({
                where: { id: parseInt(id) },
                include: { category: true },
            });
        }

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Verify Exclusive Tier Access
        if (product.exclusiveForTier) {
            const { getUser } = await import('@/lib/auth');
            const user = await getUser();
            const userTier = user?.referralTier || 'BRONZE';
            
            if (product.exclusiveForTier === 'GOLD' && userTier !== 'GOLD') {
                return NextResponse.json({ error: 'Exclusive Tier: Gold Ambassador Status Required', exclusive: true, requiredTier: 'GOLD' }, { status: 403 });
            }
            if (product.exclusiveForTier === 'SILVER' && !['SILVER', 'GOLD'].includes(userTier)) {
                return NextResponse.json({ error: 'Exclusive Tier: Silver Ambassador Status Required', exclusive: true, requiredTier: 'SILVER' }, { status: 403 });
            }
        }

        product.images = JSON.parse(product.images);

        // Get related products from same category
        const related = await prisma.product.findMany({
            where: { categoryId: product.categoryId, id: { not: product.id } },
            take: 4,
            include: { category: true },
        });

        return NextResponse.json({
            product,
            related: related.map(p => ({ ...p, images: JSON.parse(p.images) })),
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // If images are provided as array, stringify them
        if (body.images && Array.isArray(body.images)) {
            body.images = JSON.stringify(body.images);
        }

        // Clean up nested related objects before update
        if (body.category) delete body.category;
        if (body.createdAt) delete body.createdAt;

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: body,
            include: { category: true }
        });

        product.images = JSON.parse(product.images);
        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
