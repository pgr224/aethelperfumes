import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ subscribers });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { subject, content, couponCode } = await request.json();

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and Content are required' }, { status: 400 });
        }

        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { active: true }
        });

        if (subscribers.length === 0) {
            return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
        }

        // Simulating Bulk Email Sending
        console.log(`--- SIMULATING BULK EMAIL ---`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${content}`);
        if (couponCode) console.log(`Incentive: Coupon ${couponCode} attached.`);
        console.log(`Sending to ${subscribers.length} recipients...`);
        
        // In a real scenario, you'd use a service like Resend, SendGrid, or Mailchimp here.
        // for (const sub of subscribers) {
        //    await sendEmail(sub.email, subject, content);
        // }

        return NextResponse.json({ 
            success: true, 
            message: `Newsletter queued for ${subscribers.length} subscribers.` 
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
