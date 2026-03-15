import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const globalForPrisma = globalThis;

const getPrisma = () => {
    // Detect Vercel build environment or Next.js build phase
    const isBuild = 
        process.env.NEXT_PHASE === 'phase-production-build' || 
        process.env.VERCEL === '1' ||
        process.env.CI === 'true';

    if (isBuild) {
        // Return a dummy object that absorbs all calls during build
        const mock = new Proxy(() => mock, {
            get: () => mock
        });
        return mock;
    }

    if (!globalForPrisma.prisma) {
        try {
            const { PrismaClient } = require('@prisma/client');
            globalForPrisma.prisma = new PrismaClient();
        } catch (e) {
            console.error('Prisma failed to load:', e);
            return null;
        }
    }
    return globalForPrisma.prisma;
};

// Use a proxy to lazily initialize the Prisma client only when used
const prisma = new Proxy({}, {
    get: (target, prop) => {
        // Handle common runtime inspections to avoid triggering the loader
        if (prop === 'then' || prop === 'constructor' || prop === 'prototype') return undefined;
        if (typeof prop === 'symbol') return undefined;

        const client = getPrisma();
        if (!client) return undefined;
        
        return client[prop];
    }
});

export default prisma;




