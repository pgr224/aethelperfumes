import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const globalForPrisma = globalThis;

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

    // Detect Cloudflare D1 Environment
    // OpenNext 3+ shims bindings into process.env[binding_name]
    const d1Binding = process.env.DB;
    const isCloudflare = !!(process.env.CF_PAGES || process.env.CLOUDFLARE_ACCOUNT_ID || process.env.WORKERS_CI);

    if (isCloudflare && d1Binding) {
        try {
            const { PrismaD1 } = await import('@prisma/adapter-d1');
            const adapter = new PrismaD1(d1Binding);
            globalForPrisma.prisma = new PrismaClient({ adapter });
            console.log('Prisma initialized with Cloudflare D1 adapter.');
            return globalForPrisma.prisma;
        } catch (error) {
            console.error('Failed to initialize D1 adapter:', error);
        }
    }

    // Fallback to SQLite (local) or Postgres
    const provider = process.env.PRISMA_DB_PROVIDER || (isCloudflare ? 'postgres' : 'sqlite');

    if (provider === 'sqlite') {
        try {
            const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
            const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
            const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
            globalForPrisma.prismaAdapter = adapter;
            globalForPrisma.prisma = new PrismaClient({ adapter });
        } catch (error) {
            console.error('Failed to initialize SQLite adapter:', error);
        }
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
                'Failed to initialize Prisma Postgres client.',
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
