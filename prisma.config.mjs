import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const provider = process.env.PRISMA_DB_PROVIDER || 'sqlite';
const isSqlite = provider === 'sqlite';
const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';

export default defineConfig({
  schema: isSqlite ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma',

  datasource: {
    url: sqliteUrl
  }
});

