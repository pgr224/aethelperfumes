import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const globalForPrisma = globalThis;

const resolveProvider = () => {
    const explicit = process.env.PRISMA_DB_PROVIDER;
    if (explicit === 'postgres' || explicit === 'sqlite') {
        return explicit;
    }

    if (
      process.env.CF_PAGES || 
      process.env.CLOUDFLARE_ACCOUNT_ID || 
      process.env.WORKERS_CI ||
      process.env.NEXT_RUNTIME === 'edge'
    ) {
        return 'postgres';
    }

    if (process.env.NODE_ENV === 'production') {
        return 'postgres';
    }

    return 'sqlite';
};

const provider = resolveProvider();

const createUnavailablePrisma = (message, error) => {
    if (error) {
        console.error(message, error);
    }

    const unavailableAsync = () => Promise.reject(new Error(message));
    const unavailableCallable = new Proxy(unavailableAsync, {
        get() {
            return unavailableCallable;
        },
        apply() {
            return Promise.reject(new Error(message));
        }
    });

    return new Proxy(
        {},
        {
            get() {
                return unavailableCallable;
            }
        }
    );
};

const initPrisma = async () => {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    if (provider === 'sqlite') {
        const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
        const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
        const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
        globalForPrisma.prismaAdapter = adapter;
        globalForPrisma.prisma = new PrismaClient({ adapter });
    } else {
        try {
            const { PrismaPg } = await import('@prisma/adapter-pg');
            const { default: pkg } = await import('pg');
            const { Pool } = pkg;
            
            const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
            const hasValidConnectionString =
                !!connectionString && !connectionString.includes('[YOUR-SUPABASE-DB-PASSWORD]');

            if (!hasValidConnectionString) {
                globalForPrisma.prisma = createUnavailablePrisma(
                    'Missing valid DIRECT_URL/DATABASE_URL for Supabase.'
                );
            } else {
                // Strip sslmode from URL so pg uses our explicit ssl config
                const cleanConnString = (() => {
                    try {
                        const u = new URL(connectionString);
                        u.searchParams.delete('sslmode');
                        return u.toString();
                    } catch { return connectionString; }
                })();

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
                    ? { connectionString: cleanConnString, ssl: { rejectUnauthorized: false } }
                    : { connectionString: cleanConnString };

                const pool = globalForPrisma.prismaPool || new Pool(poolConfig);
                const adapter = globalForPrisma.prismaAdapter || new PrismaPg(pool);

                globalForPrisma.prismaPool = pool;
                globalForPrisma.prismaAdapter = adapter;
                globalForPrisma.prisma = new PrismaClient({ adapter });
            }
        } catch (error) {
            console.error('Prisma initialization failed:', error);
            globalForPrisma.prisma = createUnavailablePrisma(
                'Failed to initialize Prisma Postgres client for Cloudflare runtime.',
                error
            );
        }
    }
    return globalForPrisma.prisma;
};

// Next.js 16 Top-level await support in ESM
let prisma = globalForPrisma.prisma;
if (!prisma) {
  prisma = await initPrisma();
}

export default prisma;
