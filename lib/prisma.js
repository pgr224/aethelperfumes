import 'dotenv/config';

const globalForPrisma = globalThis;

const initPrisma = async () => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }

    const isCloudflare = !!(
        process.env.CF_PAGES || 
        process.env.CLOUDFLARE_ACCOUNT_ID || 
        process.env.WORKERS_CI || 
        process.env.NEXT_RUNTIME === 'edge'
    );

    // Dynamic import to either Node or Edge client
    const { PrismaClient } = isCloudflare ? await import('@prisma/client/edge') : await import('@prisma/client');

    if (isCloudflare) {
        try {
            const { getCloudflareContext } = await import('@opennextjs/cloudflare');
            const cloudflareCtx = getCloudflareContext();
            const env = cloudflareCtx?.env || {};
            const d1Binding = env?.DB || process.env.DB;

            if (d1Binding) {
                const { PrismaD1 } = await import('@prisma/adapter-d1');
                const adapter = new PrismaD1(d1Binding);
                const client = new PrismaClient({ adapter });
                globalForPrisma.prisma = client;
                return client;
            }
        } catch (error) {
            console.error('D1 binding not available in this context. Error:', error);
        }
    }

    // Local Fallback to SQLite (No Postgres, Vercel, or Render dependencies)
    try {
        const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
        const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
        const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
        const client = new PrismaClient({ adapter });
        globalForPrisma.prisma = client;
        return client;
    } catch (error) {
        console.error('Failed to initialize local SQLite fallback:', error);
        throw new Error('Database initialization failed');
    }
};

const prisma = new Proxy({}, {
    get(target, prop) {
        if (prop === 'then') return undefined; // Required to prevent promise resolution loop
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
