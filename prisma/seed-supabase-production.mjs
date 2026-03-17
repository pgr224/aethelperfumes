import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const REQUIRED_CONFIRMATION = 'I_UNDERSTAND_THIS_TOUCHES_PRODUCTION';

function assertProductionGuards() {
    const confirmation = process.env.PRODUCTION_SEED_CONFIRM;
    if (confirmation !== REQUIRED_CONFIRMATION) {
        throw new Error(
            `Refusing to run production seed. Set PRODUCTION_SEED_CONFIRM=${REQUIRED_CONFIRMATION}`
        );
    }

    const adminEmail = process.env.PRODUCTION_ADMIN_EMAIL;
    const adminPassword = process.env.PRODUCTION_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error('PRODUCTION_ADMIN_EMAIL and PRODUCTION_ADMIN_PASSWORD are required.');
    }

    if (adminPassword.length < 12) {
        throw new Error('PRODUCTION_ADMIN_PASSWORD must be at least 12 characters.');
    }
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is required for production seeding.');
}

assertProductionGuards();

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
    const adminEmail = process.env.PRODUCTION_ADMIN_EMAIL;
    const adminPassword = process.env.PRODUCTION_ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            name: 'Aethel Production Admin',
            role: 'admin',
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Aethel Production Admin',
            role: 'admin',
        },
    });

    await upsertSetting('site_name', 'AETHEL PARFUMS');
    await upsertSetting('tagline', 'Secret for a Luxurious Life');
    await upsertSetting('featuredTitle', 'AETHEL Collection');
    await upsertSetting('featuredSubtitle', 'Secret for a Luxurious Life');
    await upsertSetting('currency', 'USD');
    await upsertSetting('currencySymbol', '$');
    await upsertSetting('contactEmail', adminEmail);

    console.log('Production seed completed with safety guards.');
    console.log(`Production admin email: ${adminEmail}`);
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