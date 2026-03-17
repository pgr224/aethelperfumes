import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const globalForPrisma = globalThis;

const resolveProvider = () => {
    const explicit = process.env.PRISMA_DB_PROVIDER;
    if (explicit === 'postgres' || explicit === 'sqlite') {
        return explicit;
    }

    if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
        return 'postgres';
    }

    if (process.env.CF_PAGES || process.env.CLOUDFLARE_ACCOUNT_ID || process.env.WORKERS_CI) {
        return 'postgres';
    }

    if (process.env.NODE_ENV === 'production') {
        return 'postgres';
    }

    return 'sqlite';
};

const provider = resolveProvider();

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
            // Keep module import safe during CI/build analysis; reject only when methods are invoked.
            const unavailableMessage = 'Missing valid DIRECT_URL/DATABASE_URL for Supabase.';
            const unavailableAsync = () => Promise.reject(new Error(unavailableMessage));
            const unavailableCallable = new Proxy(unavailableAsync, {
                get() {
                    return unavailableCallable;
                },
                apply() {
                    return Promise.reject(new Error(unavailableMessage));
                }
            });

            globalForPrisma.prisma = new Proxy(
                {},
                {
                    get() {
                        return unavailableCallable;
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
