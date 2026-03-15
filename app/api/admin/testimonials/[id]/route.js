import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        
        const updated = await prisma.testimonial.update({
            where: { id: parseInt(id) },
            data: body
        });

        return NextResponse.json({ success: true, testimonial: updated });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await prisma.testimonial.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
