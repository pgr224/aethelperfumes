import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const isPlaceholder = (value) => {
  if (!value) return true;
  return value.includes('[YOUR-SUPABASE-DB-PASSWORD]');
};

const provider = process.env.PRISMA_DB_PROVIDER || 'postgres';
const isSqlite = provider === 'sqlite';
const invocation = [
  process.argv.join(' '),
  process.env.npm_lifecycle_script || '',
  process.env.npm_command || ''
]
  .join(' ')
  .toLowerCase();

const isDbTouchingPrismaCommand =
  /\bmigrate\b/.test(invocation) ||
  /\bdb\s+(push|pull|execute)\b/.test(invocation) ||
  /\bintrospect\b/.test(invocation) ||
  /\bstudio\b/.test(invocation) ||
  /\bseed\b/.test(invocation);

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL || databaseUrl;
const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';

const fallbackPostgresUrl = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public';
const hasInvalidSupabaseUrls = isPlaceholder(databaseUrl) || isPlaceholder(directUrl);
const effectivePostgresUrl = hasInvalidSupabaseUrls ? fallbackPostgresUrl : directUrl;

if (!isSqlite && hasInvalidSupabaseUrls && isDbTouchingPrismaCommand) {
  throw new Error('DATABASE_URL and DIRECT_URL must contain real Supabase credentials for Prisma DB operations.');
}

if (!isSqlite && hasInvalidSupabaseUrls && !isDbTouchingPrismaCommand) {
  console.warn('Prisma is running without real DATABASE_URL/DIRECT_URL. Using a local fallback URL for non-DB operations (e.g. client generation).');
}

export default defineConfig({
  schema: isSqlite ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma',

  datasource: {
    url: isSqlite ? sqliteUrl : effectivePostgresUrl,
    directUrl: isSqlite ? undefined : effectivePostgresUrl
  }
});

