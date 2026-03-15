import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

const provider = process.env.PRISMA_DB_PROVIDER || (process.env.VERCEL ? 'postgres' : 'sqlite');

if (!globalForPrisma.prisma) {
    if (provider === 'sqlite') {
        const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
        const adapter = new PrismaBetterSQLite3({ url: sqliteUrl });
        globalForPrisma.prismaAdapter = adapter;
        globalForPrisma.prisma = new PrismaClient({ adapter });
    } else {
        const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

        if (!connectionString || connectionString.includes('[YOUR-SUPABASE-DB-PASSWORD]')) {
            throw new Error('Missing valid DIRECT_URL/DATABASE_URL for Supabase.');
        }

        const shouldUseSsl = (() => {
            try {
                const parsed = new URL(connectionString);
                if (parsed.searchParams.get('sslmode') === 'disable') return false;
                return parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
            } catch {
                return false;
            }
        })();

        const poolConfig = shouldUseSsl
            ? { connectionString, ssl: { rejectUnauthorized: false } }
            : { connectionString };

        const pool = globalForPrisma.prismaPool || new Pool(poolConfig);
        const adapter = globalForPrisma.prismaAdapter || new PrismaPg(pool);

        globalForPrisma.prismaPool = pool;
        globalForPrisma.prismaAdapter = adapter;
        globalForPrisma.prisma = new PrismaClient({ adapter });
    }
}

const prisma = globalForPrisma.prisma;

export default prisma;
