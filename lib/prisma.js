import 'dotenv/config';

const globalForPrisma = globalThis;

const createUnavailablePrisma = (message, error) => {
    if (error) console.error(message, error);
    const unavailableAsync = () => Promise.reject(new Error(message));
    const unavailableCallable = new Proxy(unavailableAsync, {
        get() { return unavailableCallable; },
        apply() { return Promise.reject(new Error(message)); }
    });
    return new Proxy({}, {
        get(target, prop) {
            if (prop === '_isUnavailable') return true;
            return unavailableCallable;
        }
    });
};

const initPrisma = async () => {
    if (globalForPrisma.prisma && !globalForPrisma.prisma._isUnavailable) {
        return globalForPrisma.prisma;
    }

    const isCloudflare = !!(
        process.env.CF_PAGES || 
        process.env.CLOUDFLARE_ACCOUNT_ID || 
        process.env.WORKERS_CI || 
        process.env.NEXT_RUNTIME === 'edge'
    );

    if (isCloudflare) {
        try {
            const { getCloudflareContext } = await import('@opennextjs/cloudflare');
            const cloudflareCtx = getCloudflareContext();
            const env = cloudflareCtx?.env || {};
            const d1Binding = env?.DB || process.env.DB;

            if (d1Binding) {
                // Use the Cloudflare-specific generated client (runtime="cloudflare")
                const { PrismaClient } = await import('@prisma/client');
                const { PrismaD1 } = await import('@prisma/adapter-d1');
                const adapter = new PrismaD1(d1Binding);
                const client = new PrismaClient({ adapter });
                globalForPrisma.prisma = client;
                return client;
            }
        } catch (error) {
            console.error('D1 binding not available in this context. Error:', error);
            console.error('Stack:', error.stack);
        }
    }

    const provider = process.env.PRISMA_DB_PROVIDER || (isCloudflare ? 'postgres' : 'sqlite');

    if (provider === 'sqlite') {
        try {
            const { PrismaClient } = await import('@prisma/client');
            const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
            const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
            const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
            const client = new PrismaClient({ adapter });
            globalForPrisma.prisma = client;
            return client;
        } catch (error) {
            console.error('Failed to initialize local SQLite:', error);
            return createUnavailablePrisma('Local SQLite initialization failed.');
        }
    } else {
        try {
            const { PrismaClient } = await import('@prisma/client');
            const { PrismaPg } = await import('@prisma/adapter-pg');
            const { default: pkg } = await import('pg');
            const { Pool } = pkg;
            const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
            if (!connectionString || connectionString.includes('[YOUR-SUPABASE-DB-PASSWORD]')) {
                return createUnavailablePrisma('Missing valid credentials for Postgres.');
            }
            const cleanString = connectionString.replace(/sslmode=[^&]+/, '');
            const shouldSsl = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
            const pool = new Pool(shouldSsl ? { connectionString: cleanString, ssl: { rejectUnauthorized: false } } : { connectionString: cleanString });
            const adapter = new PrismaPg(pool);
            const client = new PrismaClient({ adapter });
            globalForPrisma.prisma = client;
            return client;
        } catch (error) {
            console.error('Postgres init failed:', error);
            return createUnavailablePrisma('Postgres initialization failed.', error);
        }
    }
};

const prisma = new Proxy({}, {
    get(target, prop) {
        if (prop === 'then') return undefined;
        return new Proxy(() => {}, {
            get(fnTarget, fnProp) {
                return async (...args) => {
                    const client = await initPrisma();
                    return client[prop][fnProp](...args);
                };
            },
            apply(fnTarget, thisArg, args) {
                return (async () => {
                    const client = await initPrisma();
                    return client[prop](...args);
                })();
            }
        });
    }
});

export { initPrisma };
export default prisma;
