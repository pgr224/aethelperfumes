import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const globalForPrisma = globalThis;

const getPrisma = () => {
    // Check for Next.js build phase or Vercel build environment
    // We also check for 'phase-production-build' which is set by Next.js in some contexts
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

    if (isBuild) {
        // Return an infinitely recursive proxy during build
        const createMock = () => {
            const mock = () => ({});
            return new Proxy(mock, {
                get: (target, prop) => {
                    if (prop === 'then') return undefined; // Avoid promise-like behavior
                    return createMock();
                }
            });
        };
        return createMock();
    }

    if (!globalForPrisma.prisma) {
        const { PrismaClient } = require('@prisma/client');
        globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
};

// Use a proxy to lazily initialize the Prisma client only when used
const prisma = new Proxy({}, {
    get: (target, prop) => {
        const client = getPrisma();
        // Standard safeguards
        if (prop === 'then') return undefined;
        if (typeof prop === 'symbol') return client ? client[prop] : undefined;
        
        return client ? client[prop] : undefined;
    }
});

export default prisma;



