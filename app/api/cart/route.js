import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

function getSessionId(cookieStore) {
    let sessionId = cookieStore.get('cart_session')?.value;
    if (!sessionId) {
        sessionId = uuidv4();
    }
    return sessionId;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('cart_session')?.value;

        if (!sessionId) {
            return NextResponse.json({ items: [], total: 0, count: 0 });
        }

        const items = await prisma.cartItem.findMany({
            where: { sessionId },
            include: { product: { include: { category: true } } },
            orderBy: { createdAt: 'desc' },
        });

        const parsed = items.map(item => {
            let images = [];
            try {
                images = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
            } catch (e) {
                console.error(`Failed to parse images for product ${item.productId}:`, e);
                images = [];
            }
            return {
                ...item,
                product: { ...item.product, images },
            };
        });

        const total = parsed.reduce((sum, item) => {
            const price = item.product.salePrice || item.product.price;
            return sum + price * item.quantity;
        }, 0);

        return NextResponse.json({ items: parsed, total, count: items.length });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const { productId, quantity = 1 } = await request.json();
        const sessionId = getSessionId(cookieStore);

        // Upsert cart item
        const existing = await prisma.cartItem.findUnique({
            where: { sessionId_productId: { sessionId, productId } },
        });

        let item;
        if (existing) {
            item = await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
                include: { product: true },
            });
        } else {
            item = await prisma.cartItem.create({
                data: { sessionId, productId, quantity },
                include: { product: true },
            });
        }

        const response = NextResponse.json({ item, message: 'Added to cart' });
        response.cookies.set('cart_session', sessionId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('cart_session')?.value;
        if (!sessionId) {
            return NextResponse.json({ error: 'No cart session' }, { status: 400 });
        }

        const { itemId, quantity } = await request.json();

        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
            return NextResponse.json({ message: 'Item removed' });
        }

        const item = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });

        return NextResponse.json({ item });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('cart_session')?.value;
        if (!sessionId) {
            return NextResponse.json({ error: 'No cart session' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');

        if (itemId) {
            await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });
        } else {
            await prisma.cartItem.deleteMany({ where: { sessionId } });
        }

        return NextResponse.json({ message: 'Removed from cart' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
