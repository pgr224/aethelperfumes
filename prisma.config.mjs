import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const isPlaceholder = (value) => {
  if (!value) return true;
  return value.includes('[2204asw@SupaA]');
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

const databaseUrl = 'postgresql://postgres.hyrpuignsmmatkekjaly:2204asw%40SupaA@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';
const directUrl = process.env.DIRECT_URL || databaseUrl;
const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db';

const getSupabaseRef = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const match = baseUrl.match(/^https:\/\/([^.]+)\.supabase\.co$/);
  return match ? match[1] : null;
};

const normalizeSupabaseDirectUrl = (value) => {
  if (!value) return value;
  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes('pooler.supabase.com')) return value;

    const ref = getSupabaseRef();
    if (!ref) return value;

    parsed.hostname = `db.${ref}.supabase.co`;
    parsed.port = '5432';
    parsed.searchParams.delete('pgbouncer');
    return parsed.toString();
  } catch {
    return value;
  }
};

const cliPostgresUrl = normalizeSupabaseDirectUrl(directUrl);
const fallbackPostgresUrl = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public';
const hasInvalidSupabaseUrls = isPlaceholder(databaseUrl) || isPlaceholder(directUrl);
const effectivePostgresUrl = hasInvalidSupabaseUrls ? fallbackPostgresUrl : cliPostgresUrl;

if (!isSqlite && hasInvalidSupabaseUrls && isDbTouchingPrismaCommand) {
  throw new Error('DATABASE_URL and DIRECT_URL must contain real Supabase credentials for Prisma DB operations.');
}

if (!isSqlite && hasInvalidSupabaseUrls && !isDbTouchingPrismaCommand) {
  console.warn('Prisma is running without real DATABASE_URL/DIRECT_URL. Using a local fallback URL for non-DB operations (e.g. client generation).');
}

export default defineConfig({
  schema: isSqlite ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma',

  datasource: {
    url: isSqlite ? sqliteUrl : effectivePostgresUrl
  }
});

