import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const settings = await prisma.siteSetting.findMany();
        // Convert array of {key, value} to a single object
        const settingsMap = settings.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {});

        // Default settings if they don't exist
        const defaultSettings = {
            currency: 'USD',
            currencySymbol: '$',
            paymentMethod: 'stripe',
            gatewayMode: 'test',
            taxRate: '0',
            shippingFlatRate: '15',
            storeStatus: 'active',
            contactEmail: 'concierge@aethel.com'
        };

        return NextResponse.json({ 
            settings: { ...defaultSettings, ...settingsMap } 
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Body should be an object of key:value pairs
        const updates = Object.entries(body).map(([key, value]) => {
            return prisma.siteSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
