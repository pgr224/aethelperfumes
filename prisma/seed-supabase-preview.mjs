import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is required for Supabase preview seeding.');
}

// Strip sslmode from URL so pg uses our explicit ssl config instead of verify-full
const connUrl = new URL(connectionString);
connUrl.searchParams.delete('sslmode');
connectionString = connUrl.toString();

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function upsertSetting(key, value) {
    await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
}

async function main() {
    const adminEmail = process.env.PREVIEW_ADMIN_EMAIL || 'preview-admin@example.com';
    const adminPassword = process.env.PREVIEW_ADMIN_PASSWORD || 'preview-admin-123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            name: 'Preview Admin',
            role: 'admin',
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Preview Admin',
            role: 'admin',
        },
    });

    const category = await prisma.category.upsert({
        where: { slug: 'preview-collection' },
        update: {
            name: 'Preview Collection',
            description: 'Safe preview-only catalog data.',
            productCount: 1,
        },
        create: {
            name: 'Preview Collection',
            slug: 'preview-collection',
            description: 'Safe preview-only catalog data.',
            productCount: 1,
        },
    });

    await prisma.product.upsert({
        where: { slug: 'preview-signature' },
        update: {
            name: 'Preview Signature',
            description: 'Preview-safe fragrance record for deployed test environments.',
            shortDesc: 'Amber · Citrus · Woods',
            price: 99,
            images: JSON.stringify(['/images/aethel/placeholder.jpg']),
            categoryId: category.id,
            notes: 'Amber, Citrus, Woods',
            stock: 25,
            featured: true,
        },
        create: {
            name: 'Preview Signature',
            slug: 'preview-signature',
            description: 'Preview-safe fragrance record for deployed test environments.',
            shortDesc: 'Amber · Citrus · Woods',
            price: 99,
            images: JSON.stringify(['/images/aethel/placeholder.jpg']),
            categoryId: category.id,
            notes: 'Amber, Citrus, Woods',
            stock: 25,
            featured: true,
        },
    });

    await upsertSetting('site_name', 'AETHEL PARFUMS');
    await upsertSetting('tagline', 'Secret for a Luxurious Life');
    await upsertSetting('featuredTitle', 'AETHEL Collection');
    await upsertSetting('featuredSubtitle', 'Secret for a Luxurious Life');
    await upsertSetting('currency', 'USD');
    await upsertSetting('currencySymbol', '$');
    await upsertSetting('contactEmail', adminEmail);

    console.log('Supabase preview seed completed.');
    console.log(`Preview admin email: ${adminEmail}`);
    console.log(`Preview admin password: ${adminPassword}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });