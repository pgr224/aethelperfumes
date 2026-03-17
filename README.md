This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## One-Click Workflow

Local testing uses SQLite by default. Production deploys use Supabase Postgres.

VS Code one-click tasks:

- `Terminal > Run Task > Local: Dev (SQLite)`
- `Terminal > Run Task > Local: Seed Admin (SQLite)`
- `Terminal > Run Task > Local: Seed + Dev (SQLite)`
- `Terminal > Run Task > Supabase: Preview Seed`
- `Terminal > Run Task > Supabase: Production Seed (Guarded)`
- `Terminal > Run Task > Vercel: Deploy Preview`
- `Terminal > Run Task > Vercel: Deploy Production`

CLI equivalents:

```bash
npm run local
npm run local:seed
npm run local:bootstrap
npm run db:seed:supabase:preview
npm run db:seed:supabase:prod
npm run deploy:preview
npm run deploy:prod
```

Local admin login after seeding:

```text
admin@aethelparfums.com
admin123
```

## Supabase Setup

This app uses Prisma for all server-side database access. Supabase should therefore be connected as the Postgres database behind Prisma, not by replacing the existing data layer with direct client calls.

Create a local environment file at `.env` so Prisma and Next.js both see the same values. If you want, you can duplicate them into `.env.local` later for local overrides.

```bash
DATABASE_URL="postgresql://postgres:[YOUR-SUPABASE-DB-PASSWORD]@db.hyrpuignsmmatkekjaly.supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[YOUR-SUPABASE-DB-PASSWORD]@db.hyrpuignsmmatkekjaly.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://hyrpuignsmmatkekjaly.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="change-this-before-production"
```

Notes:

- `DATABASE_URL` and `DIRECT_URL` require your Supabase Postgres password from Project Settings > Database. The anon key is not sufficient for Prisma.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the Supabase client helpers in `lib/supabase`.
- `SUPABASE_SERVICE_ROLE_KEY` is only needed for privileged server-side Supabase operations. Keep it server-only.

After setting the variables, run:

```bash
npm run db:migrate:supabase
npm run db:seed:supabase:preview
```

If this Supabase database is empty and you want the current catalog/admin data loaded, run one of the existing seed scripts after migrations.

The preview seed is non-destructive. It uses `upsert` only, so it is safe for preview/staging databases and will not wipe existing records.

Production seed is separate and guarded:

1. `PRODUCTION_ADMIN_EMAIL` and `PRODUCTION_ADMIN_PASSWORD` must be set.
2. Password must be at least 12 characters.
3. `PRODUCTION_SEED_CONFIRM` must exactly equal `I_UNDERSTAND_THIS_TOUCHES_PRODUCTION`.

Then run:

```bash
npm run db:seed:supabase:prod
```

If direct Prisma connectivity to Supabase is blocked from your machine, run [prisma/supabase-init.sql](prisma/supabase-init.sql) in the Supabase SQL Editor to create the tables.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The project is already configured for Vercel with [vercel.json](vercel.json).

Required Vercel environment variables:

```bash
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
PRISMA_DB_PROVIDER=postgres
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PREVIEW_ADMIN_EMAIL=
PREVIEW_ADMIN_PASSWORD=
PRODUCTION_ADMIN_EMAIL=
PRODUCTION_ADMIN_PASSWORD=
PRODUCTION_SEED_CONFIRM=I_UNDERSTAND_THIS_TOUCHES_PRODUCTION
```

One-click publish options:

1. In VS Code, run `Vercel: Deploy Production`.
2. Or import the repo into Vercel once, set the env vars, and every push will auto-deploy.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
