import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        let sort = searchParams.get('sort') || 'createdAt';
        let order = searchParams.get('order') || 'desc';

        if (sort === 'price-asc') {
            sort = 'price';
            order = 'asc';
        } else if (sort === 'price-desc') {
            sort = 'price';
            order = 'desc';
        } else if (sort === 'rating') {
            sort = 'rating';
            order = 'desc';
        }
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const search = searchParams.get('search');

        // Check user tier for exclusive collections
        const { getUser } = await import('@/lib/auth');
        const user = await getUser();
        const userTier = user?.referralTier || 'BRONZE';

        const where = {};
        if (category) where.category = { slug: category };
        if (featured === 'true') where.featured = true;
        if (search) where.name = { contains: search };

        // Exclude exclusive products unless user has the tier
        // Must use OR with null check - SQLite NOT excludes NULL rows
        if (userTier !== 'GOLD') {
            where.OR = [
                { exclusiveForTier: null },
                { exclusiveForTier: { not: 'GOLD' } }
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy: { [sort]: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        // Parse images JSON
        const parsed = products.map(p => ({
            ...p,
            images: JSON.parse(p.images),
        }));

        return NextResponse.json({
            products: parsed,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            name, slug, description, shortDesc, price, salePrice, 
            stock, inStock, volume, categoryId, badge, exclusiveForTier, images 
        } = body;

        // Simple validation
        if (!name || !slug || !price || !categoryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                shortDesc,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                stock: parseInt(stock),
                inStock: Boolean(inStock),
                volume,
                categoryId: parseInt(categoryId),
                badge,
                exclusiveForTier,
                images: JSON.stringify(images.filter(img => img !== ''))
            }
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Product creation error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
