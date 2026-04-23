# Article CMS — Day 1 Starter

Next.js 16 · Prisma 7 · Supabase · DaisyUI · TypeScript

This is the starter repository for Day 1 of the training. The Article model is pre-built and seed data is included so you can focus on querying and mutating data rather than setting up boilerplate.

---

## Pre-work Checklist

Before the training session, make sure you have:

- [ ] Node.js **20.9 or later** — check with `node --version`
- [ ] A package manager — `npm` works; `pnpm` is faster (`npm install -g pnpm`)
- [ ] VS Code (or equivalent) with the **ESLint** extension installed
- [ ] Git installed and a GitHub account signed in
- [ ] A free [Supabase](https://supabase.com) account created
- [ ] A free [Vercel](https://vercel.com) account created (for deployment stretch goal)

---

## Setup Steps

### 1. Clone and install

```bash
git clone <repo-url>
cd react-postgre-training
npm install        # or: pnpm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, set a database password, pick a region close to you
3. Wait ~1 minute for the project to provision

Then grab your connection strings:

- **Dashboard → Project Settings → Database → Connection string**
  - Copy the **Transaction** URI (port `6543`) → this is your `DATABASE_URL`
  - Copy the **Session** URI (port `5432`) → this is your `DIRECT_URL`
- **Dashboard → Project Settings → API**
  - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all four values from step 2.

> `.env` is git-ignored (the `.gitignore` covers `.env*`). Next.js and Prisma CLI both read `.env` automatically — no need for two files.

### 4. Push the schema to Supabase

```bash
npm run db:push
```

This reads `prisma/schema.prisma` and creates the `Article` table in your Supabase database. You should see `Your database is now in sync with your Prisma schema.`

> We use `db push` (not `migrate dev`) during training because it's faster for iteration. In production you'd use migrations.

### 5. Seed sample data

```bash
npm run db:seed
```

Inserts 3 sample articles so you have data to query immediately. Re-running is safe — it skips duplicates.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Article CMS welcome page with DaisyUI styling.

### 7. Explore with Prisma Studio (optional)

```bash
npm run db:studio
```

Opens a visual database browser at `http://localhost:5555`. You can inspect the seeded articles, add rows manually, and verify schema changes after `db:push`.

---

## Project Structure

```
.
├── app/
│   ├── layout.tsx          # Root layout — Nav + <html>/<body>
│   └── page.tsx            # Welcome page (placeholder)
├── components/
│   ├── ui/
│   │   ├── Button.tsx      # DaisyUI btn wrapper
│   │   ├── Card.tsx        # DaisyUI card wrapper
│   │   └── Input.tsx       # DaisyUI input + label + error
│   └── nav.tsx             # Top navigation bar (add links here)
├── lib/
│   ├── prisma.ts           # PrismaClient singleton (globalThis pattern)
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client (async cookies)
│   │   └── proxy.ts        # Session refresh helper (used by proxy.ts)
│   └── zod-schemas.ts      # Add your Zod schemas here
├── prisma/
│   ├── schema.prisma       # Article model — pre-built
│   └── seed.ts             # 3 sample articles
├── proxy.ts                # Next.js 16 session proxy (commented out — Day 2)
├── .env.example            # Template for .env.local
└── next.config.ts          # Supabase Storage image remotePatterns
```

---

## Key Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (Turbopack, hot reload) |
| `npm run db:push` | Sync Prisma schema → Supabase (no migration files) |
| `npm run db:seed` | Insert sample articles |
| `npm run db:studio` | Open Prisma Studio at localhost:5555 |
| `npm run build` | Production build |
| `npx prisma generate` | Regenerate Prisma client after schema changes |

---

## Important Next.js 16 Differences

If you've used Next.js 13–15 before, note these changes:

**1. `params` and `searchParams` are async**

```tsx
// Next.js 15 and below
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
}

// Next.js 16+
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params   // ← must await
}
```

**2. `middleware.ts` is now `proxy.ts`**

Next.js 16 renamed the file and the export. The session proxy stub in this repo uses the new name. Everything else (matcher config, request/response handling) is identical.

**3. `cookies()` and `headers()` must be awaited**

```tsx
import { cookies } from 'next/headers'
const cookieStore = await cookies()  // ← must await
```

---

## What's Pre-wired vs What You Build

| Already done | You build during sessions |
|---|---|
| Prisma singleton (`lib/prisma.ts`) | `app/articles/page.tsx` (Session 2–3) |
| Supabase client factories | `app/articles/[id]/page.tsx` (Session 3) |
| Article model + seed data | `app/articles/new/page.tsx` + action (Session 4) |
| DaisyUI Button / Input / Card | `app/articles/[id]/edit/page.tsx` (Session 5) |
| Supabase Storage image config | File upload in `createArticle` (Session 6) |
| Nav shell | Zod schemas in `lib/zod-schemas.ts` (Session 4) |

---

## Deployment (Optional Stretch — End of Day 2)

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com) → **New Project**
3. Add the four environment variables from `.env.local`
4. Deploy
5. Add your Vercel production URL to Supabase → **Authentication → URL Configuration → Redirect URLs**
