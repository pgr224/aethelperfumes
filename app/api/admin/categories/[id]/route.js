import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        
        const updated = await prisma.category.update({
            where: { id: parseInt(id) },
            data: body
        });

        return NextResponse.json({ success: true, category: updated });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        
        // Count products first
        const productCount = await prisma.product.count({
            where: { categoryId: parseInt(id) }
        });

        if (productCount > 0) {
            return NextResponse.json({ error: 'Cannot delete category with active products' }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
