import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { isActive } = body;

        const updatedCoupon = await prisma.coupon.update({
            where: { id: parseInt(id) },
            data: { isActive }
        });

        return NextResponse.json({ success: true, coupon: updatedCoupon });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        await prisma.coupon.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
