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
npx prisma generate
npx prisma migrate deploy
```

If this Supabase database is empty and you want the current catalog/admin data loaded, run one of the existing seed scripts after migrations.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
