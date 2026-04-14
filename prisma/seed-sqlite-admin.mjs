import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'admin@aethel.com';
    const password = 'aethel2026';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name: 'Aethel Admin',
            role: 'admin',
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Aethel Admin',
            role: 'admin',
        },
    });

    console.log('Local SQLite admin is ready.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });