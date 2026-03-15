import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { emailNotifications, whatsappNotifications } = await request.json();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                refEmailNotifications: emailNotifications,
                refWhatsAppNotifications: whatsappNotifications
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
