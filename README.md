# Aethel Perfumes

Next.js storefront and admin app with SQLite for localhost and Cloudflare D1 for production.

## Local Development (SQLite)

Run local development against `prisma/dev.db`:

```bash
npm run local
```

Seed local admin data:

```bash
npm run local:seed
```

Seed and start together:

```bash
npm run local:bootstrap
```

Required local env in `.env` or `.env.local`:

```dotenv
PRISMA_DB_PROVIDER=sqlite
SQLITE_DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=replace-with-a-strong-local-secret
```

## Production Deployment (Cloudflare Pages + D1)

One command deploy with schema update and seed:

```bash
npm run cf:deploy
```

`cf:deploy` runs these steps in order:

1. `cf:build` - OpenNext Cloudflare build
2. `cf:prepare` - cross-platform output preparation (`scripts/prepare-cloudflare-deploy.mjs`)
3. `cf:d1:migrate` - apply remote D1 migrations from `prisma/migrations_d1`
4. `cf:d1:seed` - run idempotent seed SQL from `prisma/seed_d1.sql`
5. `cf:deploy:pages` - deploy `.open-next` to Cloudflare Pages

## Cloudflare Prerequisites

1. Authenticate Wrangler:

```bash
npx wrangler login
```

2. Confirm `wrangler.toml` project and D1 binding are correct.
3. Set production secret(s) in Cloudflare Pages/Workers:

```bash
npx wrangler secret put JWT_SECRET
```

## VS Code One-Click Tasks

Use `Terminal > Run Task`:

- `Local: Dev (SQLite)`
- `Local: Seed Admin (SQLite)`
- `Local: Seed + Dev (SQLite)`
- `Cloudflare: Build`
- `Cloudflare: D1 Migrate (Remote)`
- `Cloudflare: D1 Seed (Remote)`
- `Cloudflare: Deploy Production`

## Notes

- Supabase runtime/deploy flow has been removed.
- Local changes never touch production D1 unless you explicitly run `npm run cf:deploy` or D1 task commands.
- `prisma/seed_d1.sql` is idempotent and safe to run repeatedly.