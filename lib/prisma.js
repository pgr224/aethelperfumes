const globalForPrisma = globalThis;

const initPrisma = async () => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }

    // Detect if we are running in a Cloudflare Edge environment
    const isCloudflare = typeof process !== 'undefined' && (
        process.env.NEXT_RUNTIME === 'edge' || 
        process.env.CF_PAGES || 
        process.env.WORKERS_CI
    );

    // Dynamic import to either Node or Edge client
    let PrismaClient;
    if (isCloudflare) {
        const { PrismaClient: EdgeClient } = await import('@prisma/client/edge');
        PrismaClient = EdgeClient;
    } else {
        const prismaPkg = '@prisma' + '/client';
        const { PrismaClient: NodeClient } = await import(prismaPkg);
        PrismaClient = NodeClient;
    }

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
            } else {
                throw new Error('D1_BINDING_MISSING: The D1 database binding (DB) was not found in the Cloudflare context. Ensure it is bound in Cloudflare Pages dashboard or wrangler.toml');
            }
        } catch (error) {
            console.error('Cloudflare Edge database error:', error);
            throw error; // Never fall back to SQLite when on Cloudflare, it will crash via WASM
        }
    }

    // Local Fallback to SQLite (only executes when NODE_ENV !== 'production')
    try {
        // We use string concat and dynamic import to hide these from the bundler
        // ensuring they aren't included in the Cloudflare Edge Worker bundle.
        const adapterBase = '@prisma/adapter-better' + '-sqlite3';
        const { PrismaBetterSqlite3 } = await import(adapterBase);
        const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';
        const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
        
        const clientBase = '@prisma' + '/client';
        const { PrismaClient: SqlitePrismaClient } = await import(clientBase);
        const client = new SqlitePrismaClient({ adapter });
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
