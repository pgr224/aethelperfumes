import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

const connectionString =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    'postgresql://dummy@localhost:5432/dummy';

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

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaPool = pool;
    globalForPrisma.prismaAdapter = adapter;
    globalForPrisma.prisma = prisma;
}

export default prisma;
