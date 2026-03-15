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

const databaseUrl = process.env.DATABASE_URL;
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

if (!isSqlite && (isPlaceholder(databaseUrl) || isPlaceholder(directUrl))) {
  throw new Error('DATABASE_URL and DIRECT_URL must contain real Supabase credentials, not placeholder values.');
}

export default defineConfig({
  schema: isSqlite ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma',

  datasource: {
    url: isSqlite ? sqliteUrl : cliPostgresUrl,
    directUrl: isSqlite ? undefined : cliPostgresUrl
  }
});

