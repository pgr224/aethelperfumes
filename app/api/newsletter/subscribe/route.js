import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const subscriber = await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: { active: true },
            create: { email, active: true }
        });

        return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
