import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { categoryId, discountPercentage, action } = body;

        if (action === 'clear') {
            const result = await prisma.product.updateMany({
                where: { categoryId: parseInt(categoryId) },
                data: { salePrice: null }
            });
            return NextResponse.json({ message: `Discounts cleared for ${result.count} products.` });
        }

        if (!categoryId || !discountPercentage) {
            return NextResponse.json({ error: 'Missing category or discount value' }, { status: 400 });
        }

        const percentage = parseFloat(discountPercentage) / 100;
        
        // We need to iterate if we want to calculate based on individual prices
        // Prisma updateMany doesn't support setting a field based on another field in SQLite
        const products = await prisma.product.findMany({
            where: { categoryId: parseInt(categoryId) }
        });

        const updates = products.map(product => {
            const newSalePrice = product.price * (1 - percentage);
            return prisma.product.update({
                where: { id: product.id },
                data: { salePrice: Math.round(newSalePrice * 100) / 100 }
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ 
            success: true, 
            message: `Applied ${discountPercentage}% discount to ${products.length} products.` 
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
