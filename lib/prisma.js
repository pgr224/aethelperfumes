import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const globalForPrisma = globalThis;

const provider = process.env.PRISMA_DB_PROVIDER || (process.env.VERCEL ? 'postgres' : 'sqlite');

if (!globalForPrisma.prisma) {
    if (provider === 'sqlite') {
        const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
        const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
        const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
        globalForPrisma.prismaAdapter = adapter;
        globalForPrisma.prisma = new PrismaClient({ adapter });
    } else {
        const { PrismaPg } = require('@prisma/adapter-pg');
        const { Pool } = require('pg');
        const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

        const hasValidConnectionString =
            !!connectionString && !connectionString.includes('[YOUR-SUPABASE-DB-PASSWORD]');

        if (!hasValidConnectionString) {
            // Keep module import safe during CI/build analysis; fail only when DB methods are used.
            globalForPrisma.prisma = new Proxy(
                {},
                {
                    get() {
                        throw new Error('Missing valid DIRECT_URL/DATABASE_URL for Supabase.');
                    }
                }
            );
        } else {
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
}

const prisma = globalForPrisma.prisma;

export default prisma;
