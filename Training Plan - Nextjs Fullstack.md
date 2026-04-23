# Training Plan: Next.js + PostgreSQL (Supabase) + Prisma

**Duration:** 2 days × 6 hours (12 hours total)
**Audience:** ~7 intermediate web developers, familiar with React fundamentals from one prior project but new to Next.js App Router, server-side React, Supabase, and Prisma.
**Instructors:** 2 (you + your friend)
**Day 1 format:** Instructor-led, everyone builds the same CMS together.
**Day 2 format:** 2 teams (3 + 4 people), each building the **same domain** (Task Tracker) with modules split per person.

---

## Training Goals

By the end of Day 2, participants should be able to:

1. Reason about the Server Component / Client Component boundary and know which to reach for.
2. Model data with Prisma, connect to Supabase Postgres, and query it from Server Components.
3. Mutate data via Server Actions with proper validation, error handling, and cache invalidation.
4. Handle file upload to Supabase Storage.
5. Wire up Supabase Auth end-to-end (login, session, protected routes, logout).
6. Understand when to use Server Actions vs Route Handlers.
7. Ship and deploy a small fullstack app collaboratively.

---

## Pre-work (Send 3-5 Days Before Day 1)

Participants must arrive with:

- [ ] Node.js 20+ installed
- [ ] A package manager ready (pnpm recommended, npm acceptable)
- [ ] VS Code or equivalent editor
- [ ] Git installed and a GitHub account signed in
- [ ] A free Supabase account created ([supabase.com](https://supabase.com))
- [ ] A free Vercel account created ([vercel.com](https://vercel.com))
- [ ] Starter repo cloned and `pnpm install` already run (verify by running `pnpm dev`)
- [ ] Basic TypeScript awareness — even 20 minutes of skimming the TS handbook helps

If any participant shows up without these, they will lose the first hour of Day 1 on environment setup.

---

## Starter Template Specification

Create a repo (`article-cms-starter`) that includes everything below. Participants fork/clone this. The same starter is reused for Day 2 (teams branch from it).

### Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma (client + CLI installed)
- `@supabase/ssr` and `@supabase/supabase-js`
- Zod

### File structure

```
article-cms-starter/
├── app/
│   ├── layout.tsx            # Basic shell + <html>/<body>, Tailwind imported
│   ├── page.tsx              # Placeholder "Welcome" page
│   └── globals.css           # Tailwind directives + a few utility classes
├── components/
│   ├── ui/                   # A handful of pre-styled primitives (Button, Input, Card)
│   └── nav.tsx               # Empty nav shell
├── lib/
│   ├── prisma.ts             # Singleton pattern (globalThis.prisma trick) — PRE-WIRED
│   ├── supabase/
│   │   ├── client.ts         # Browser client — PRE-WIRED
│   │   ├── server.ts         # Server client factory — PRE-WIRED
│   │   └── middleware.ts     # Middleware session helper — PRE-WIRED
│   └── zod-schemas.ts        # Empty file, participants add schemas here
├── prisma/
│   └── schema.prisma         # datasource + generator configured, NO models yet
├── middleware.ts             # Stub that calls lib/supabase/middleware — commented out
├── .env.example              # DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md                 # Setup steps, pre-work checklist
```

### Intentionally NOT in the starter

Leave these out so participants build them:

- Any Prisma models (they write `Article` on Day 1, extend schema on Day 2)
- Any pages beyond `app/page.tsx` placeholder
- Any Server Actions
- Any form components
- Auth UI / session reading (built Day 2 morning as a guided walkthrough of the wiring that's already there)

### Reference implementations (instructor repo, DO NOT share until day end)

Have a private `article-cms-reference` repo with the completed Day 1 build + a completed Day 2 example app (one team's worth). Use it as your cheat-sheet and share link after each day ends.

---

## Day 1: Fullstack Article CMS

**Goal:** Everyone builds the same CMS together — articles with title, body (plain textarea, `white-space: pre-wrap` on render), cover image. No auth. No rich text.

**Target end state:** Working CRUD app with cover image upload, hosted locally. Each participant has it running on their machine.

### Schedule

| # | Session | Duration |
|---|---|---|
| 1 | Orientation, TypeScript Primer, React Mental Model Fix | 40 min |
| 2 | Next.js App Router & Server Components | 60 min |
|   | *Break* | 15 min |
| 3 | Data Layer: Supabase + Prisma + First Read | 50 min |
|   | *Lunch* | 60 min |
| 4 | Server Actions I: Creating an Article | 60 min |
|   | *Break* | 15 min |
| 5 | Server Actions II: Edit, Delete, Revalidation | 35 min |
| 6 | File Upload + Day 1 Wrap | 25 min |

**Total:** 360 min (6h)

### Session 1 — Orientation, TypeScript Primer, React Mental Model Fix (40 min)

**Why this session exists:** Participants have shipped React before but mostly by pattern-matching from AI/docs. This is the session where we fix the mental model before it gets worse.

Teaching checklist:

- [ ] 5 min — Training scope: what we build Day 1, what happens Day 2
- [ ] 5 min — Starter repo tour: show `lib/prisma.ts`, `lib/supabase/*`, explain what's pre-wired
- [ ] 10 min — TypeScript micro-primer:
  - [ ] `type` vs `interface` (pick one convention, stick with it)
  - [ ] Basic generics (`Array<T>`, `Promise<T>`)
  - [ ] Narrowing via `if (!value) return`
  - [ ] `as const` briefly
  - [ ] Living with TS errors instead of `any`
- [ ] 20 min — React mental model:
  - [ ] The render cycle: what triggers re-renders (state change, parent re-render)
  - [ ] State is a snapshot — why `setCount(count + 1)` twice doesn't work as you'd think
  - [ ] State updates are batched and async
  - [ ] `useEffect` dependency array: stale closure demo
  - [ ] **When NOT to use `useEffect`** (this is the big one for RSC): derived state, event handlers, data fetching at mount
  - [ ] Custom hooks: name-drop only, "just a function that calls hooks"

### Session 2 — Next.js App Router & Server Components (60 min)

**Why this session exists:** Everything else on Day 1 assumes the RSC mental model. Don't rush this.

Teaching checklist:

- [ ] App Router file conventions, live demo each:
  - [ ] `page.tsx` — route
  - [ ] `layout.tsx` — nested layouts, persist across navigations
  - [ ] `loading.tsx` — streaming Suspense boundary
  - [ ] `error.tsx` — error boundary (must be Client Component)
  - [ ] `not-found.tsx` — 404 page
- [ ] Routing:
  - [ ] File-based routing basics
  - [ ] Dynamic routes `[id]` with `params`
  - [ ] Link component and client-side navigation
- [ ] **Server Components vs Client Components** (core concept, ~25 min):
  - [ ] Default is Server — runs on server, HTML to browser, no JS shipped
  - [ ] `"use client"` directive at top of file
  - [ ] What crosses the boundary: serializable props only (no functions, no Date instances for `next/image` keys, etc.)
  - [ ] Server Components can `await` directly inside the function body
  - [ ] Server Components cannot use hooks, event handlers, or browser APIs
  - [ ] Client Components can't be `async` (pre-React-19 concern still true for components)
  - [ ] Pattern: keep Server Components at the top, push `"use client"` down the tree
  - [ ] Passing Server Components as `children` into Client Components (composition pattern)
- [ ] Create a first `app/articles/page.tsx` as a Server Component that returns a static list

### Session 3 — Data Layer: Supabase + Prisma + First Read (50 min)

Teaching checklist:

- [ ] Supabase: create project, grab connection string + anon key + service role key
- [ ] `.env.local` setup, explain `DATABASE_URL` vs `DIRECT_URL` (Supabase pooler vs direct)
- [ ] Prisma schema: define `Article` model
  - [ ] `id` (cuid), `title`, `body`, `coverImagePath` (nullable), `createdAt`, `updatedAt`
- [ ] `pnpm prisma db push` (explain: training only — in prod you'd use `prisma migrate`)
- [ ] `pnpm prisma studio` — DB inspector; add 2-3 seed rows manually
- [ ] Walk through `lib/prisma.ts` singleton pattern: WHY it exists (HMR connection leak), and the `globalThis.prisma` trick
- [ ] Back to `app/articles/page.tsx`:
  - [ ] Make it `async`
  - [ ] `const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } })`
  - [ ] Render list — this is "the moment" where RSC clicks for most people
- [ ] Dynamic route `app/articles/[id]/page.tsx` — fetch by id, render detail
  - [ ] `<pre className="whitespace-pre-wrap">{article.body}</pre>` — no rich text needed
  - [ ] Use `notFound()` if missing

### Session 4 — Server Actions I: Creating an Article (60 min)

Teaching checklist:

- [ ] `"use server"` directive: module-level vs inline
- [ ] Create `app/articles/new/page.tsx` with a form (Server Component is fine — the action goes on the form)
- [ ] Write `createArticle` action in `app/articles/actions.ts`
- [ ] Form → `action={createArticle}` → action receives `FormData`
- [ ] Zod schema for article input in `lib/zod-schemas.ts`
- [ ] Parse `FormData` → plain object → Zod validate
- [ ] Error contract: decide and use `{ ok: false, errors: {...} }` vs `{ ok: true, data: {...} }`
- [ ] **React 19 form primitives:**
  - [ ] `useActionState` for the return value / errors from action
  - [ ] `useFormStatus` for pending state (button disabled + spinner)
  - [ ] Why these need a small Client Component wrapper
- [ ] On success: `revalidatePath('/articles')` then `redirect('/articles')`
- [ ] Show in-UI that after create, the list updates without a manual refresh — sell the revalidation moment

### Session 5 — Server Actions II: Edit, Delete, Revalidation (35 min)

Teaching checklist:

- [ ] Edit:
  - [ ] `app/articles/[id]/edit/page.tsx` — fetch existing article, pre-fill form
  - [ ] `updateArticle(id, formData)` action
  - [ ] `revalidatePath` on both `/articles` and `/articles/[id]`
- [ ] Delete:
  - [ ] Delete form with a hidden input or bound action: `deleteArticle.bind(null, id)`
  - [ ] Confirmation pattern (`confirm()` is fine for training)
- [ ] `revalidatePath` vs `revalidateTag`:
  - [ ] `revalidatePath('/articles')` → nukes cached data for that path
  - [ ] `revalidateTag('articles')` → requires you to `fetch(..., { next: { tags: ['articles'] } })` or Prisma + `unstable_cache` with a tag
  - [ ] Rule of thumb: start with `revalidatePath`, reach for tags when you have reads scattered across many routes
- [ ] Mention (don't deep-dive): router cache, full route cache — one slide at most

### Session 6 — File Upload + Day 1 Wrap (25 min)

Teaching checklist:

- [ ] Supabase Storage: create a `covers` bucket (public for training), show the dashboard
- [ ] Add `<input type="file" name="cover" accept="image/*" />` to the create form
  - [ ] Form must have `enctype` handled — with Server Actions, use a plain `<form>` and the action receives the `File` in `FormData`
- [ ] In `createArticle`:
  - [ ] `const file = formData.get('cover') as File`
  - [ ] Validate (size, MIME)
  - [ ] Use Supabase server client to upload: `supabase.storage.from('covers').upload(path, file)`
  - [ ] Save `path` (not full URL) to DB
- [ ] Render: use `supabase.storage.from('covers').getPublicUrl(path)` → pass to `next/image`
  - [ ] `next/image` needs the Supabase hostname in `next.config.ts` `images.remotePatterns`
- [ ] **Wrap (5 min):**
  - [ ] Very briefly: Server Actions vs Route Handlers (`route.ts` for public HTTP, webhooks, third-party. Everything else = action.)
  - [ ] Preview Day 2: auth, team project, teams of 3 and 4, same domain (Task Tracker)
  - [ ] Reference repo link shared so they can compare their work

---

## Day 2: Team Project — Task Tracker

**Goal:** Both teams build a shared-domain task tracker, each person owning one module. Real teamwork: shared schema decisions, Git workflow, integration at the end.

**Teams:**

- Team Alpha: 4 people → 4 modules
- Team Beta: 3 people → 3 modules (drops Module D)

Both teams start from the **same starter** (Day 1 starter, not the Day 1 finished CMS). They keep nothing from the article CMS — it's a different app, reusing only what they learned.

### Schedule

| # | Session | Duration |
|---|---|---|
| 1 | Recap + Day 2 Overview | 15 min |
| 2 | Supabase Auth Walkthrough | 40 min |
| 3 | Team Planning: Domain Briefing + Schema Design | 30 min |
|   | *Break* | 15 min |
| 4 | Build Sprint 1 (instructors circulate) | 90 min |
|   | *Lunch* | 60 min |
| 5 | Build Sprint 2 + Integration | 80 min |
| 6 | Demos + Wrap | 30 min |

**Total:** 360 min (6h)

### Session 1 — Recap + Day 2 Overview (15 min)

- [ ] Recap yesterday's stack (RSC → Prisma → Server Actions → Storage)
- [ ] Introduce Task Tracker domain
- [ ] Announce teams (decide in advance: randomly, by skill, or self-select)
- [ ] Show the reference Task Tracker running briefly (optional, instructor judgment — can motivate or intimidate)

### Session 2 — Supabase Auth Walkthrough (40 min)

Live-code walkthrough of wiring auth into the starter. Everyone follows along — both teams need the same thing, so do it once.

Teaching checklist:

- [ ] Why `@supabase/ssr` (and not the deprecated `auth-helpers-nextjs`)
- [ ] Three Supabase clients, three places:
  - [ ] Browser (`lib/supabase/client.ts`) — Client Components
  - [ ] Server (`lib/supabase/server.ts`) — Server Components, Server Actions, Route Handlers
  - [ ] Middleware (`lib/supabase/middleware.ts`) — `middleware.ts` only
- [ ] `middleware.ts`: uncomment and wire the session refresh helper
- [ ] Build login + signup pages:
  - [ ] Forms use Server Actions (reinforces yesterday's pattern)
  - [ ] `supabase.auth.signInWithPassword` / `signUp`
  - [ ] Handle error returns via `useActionState`
- [ ] Reading the current user:
  - [ ] In Server Components: `const { data: { user } } = await supabase.auth.getUser()`
  - [ ] In Server Actions: same pattern
  - [ ] Pattern: `requireUser()` helper that redirects if no user
- [ ] Protected routes:
  - [ ] Route group `(app)` for authenticated pages
  - [ ] `layout.tsx` inside that group calls `requireUser()`
- [ ] Sign out as a Server Action
- [ ] Why we skip RLS in this training (Prisma uses service role → bypasses RLS anyway; app-level auth checks instead)

### Session 3 — Team Planning: Domain Briefing + Schema Design (30 min)

Run this as a shared session with both teams present, then split.

Teaching checklist (facilitate, don't lecture):

- [ ] **Task Tracker domain briefing (5 min):**
  - A logged-in user manages tasks organized into projects, with labels for cross-cutting categorization. Tasks have due dates and priorities. Some tasks have activity (comments).
- [ ] **Shared schema design (15 min, on a whiteboard):**
  - [ ] `User` is provided by Supabase Auth — reference by `authUserId` string in Prisma models
  - [ ] `Task` — id, title, description, status (todo/doing/done), priority, dueDate?, projectId?, authorId, createdAt, updatedAt
  - [ ] `Project` — id, name, description?, ownerId, createdAt
  - [ ] `Label` — id, name, color, ownerId
  - [ ] `TaskLabel` — join table for many-to-many
  - [ ] `Comment` — id, taskId, authorId, body, createdAt *(team of 4 only)*
- [ ] **Module split (10 min):**
  - Each team agrees who owns which module (see module definitions below). Instructor sanity-checks.

### Build Sprints (170 min of build + integration)

**Sprint 1 (90 min):** Each person scaffolds their module independently.

**Sprint 2 (80 min):** Finish the module + integrate.

Instructor role during sprints:

- [ ] Circulate between teams every ~15 min
- [ ] Unblock on auth/session issues first (most common blocker)
- [ ] Watch for people skipping validation — push them back to Zod
- [ ] Watch for people querying Prisma in Client Components (architectural error) — redirect them to the Server Action pattern
- [ ] Mid-sprint 2 (roughly the ~30 min mark), call "integration check": every module should be reachable from the nav by now

### Session 6 — Demos + Wrap (30 min)

- [ ] 10 min per team: live demo of their app (5 min demo + 5 min Q&A)
- [ ] 5 min wrap: key takeaways, what to read next (official Next.js docs, Prisma docs, Supabase Auth docs)
- [ ] 5 min: feedback form / informal retro

---

## Task Tracker Modules

Each person owns ONE module within their team. Modules map to route groups in the app.

### Module A — Tasks (core, always assigned)

**Owner:** 1 person per team (this should be the strongest person on the team — everyone else depends on this)

**Route group:** `app/(app)/tasks/`

**Responsibilities:**

- [ ] Task list page (filterable by status)
- [ ] Task detail page
- [ ] Create task form (Server Action)
- [ ] Edit task form
- [ ] Delete task
- [ ] Mark task as done (quick action)

**Shared contract:**

- [ ] Task has `projectId` (nullable) — Module B needs this foreign key
- [ ] Task has many Labels via `TaskLabel` — Module C needs this relation
- [ ] Task has many Comments — Module D needs this relation *(team of 4 only)*

### Module B — Projects

**Route group:** `app/(app)/projects/`

**Responsibilities:**

- [ ] Project list + detail pages
- [ ] Create / edit / delete projects
- [ ] Project detail shows tasks belonging to it (reads Module A data)
- [ ] "Create task in this project" link that pre-selects the project in Module A's form

### Module C — Labels & Filters

**Route group:** `app/(app)/labels/` + contributes UI to Module A's task list

**Responsibilities:**

- [ ] Label management page (CRUD)
- [ ] Label picker component (reused by Module A's task form)
- [ ] Filter tasks by label on the task list page (query param based)

### Module D — Activity & Comments *(team of 4 only)*

**Responsibilities:**

- [ ] Comment component added to task detail page
- [ ] Create comment Server Action
- [ ] Delete own comment
- [ ] Activity feed page showing recent comments across tasks

### Shared Responsibilities (everyone contributes)

- [ ] Navigation: each module adds its own link to the shared nav
- [ ] Color/spacing consistency: loosely agree at start, don't over-invest
- [ ] Git: branch per module (`feat/tasks`, `feat/projects`, `feat/labels`, `feat/comments`), PR into `main`, one teammate reviews before merge

---

## Git Workflow for Day 2

Covered briefly in Session 3 planning or mid-Sprint 1 if needed.

- [ ] `main` is always deployable (or at least running)
- [ ] Each person works on `feat/<module-name>`
- [ ] Commit often, push at least every 30 min
- [ ] Before pushing, `git pull --rebase origin main`
- [ ] Open a PR; one teammate reviews. Instructor reviews if team is stuck.
- [ ] Merge via squash or merge commit — team's choice, just be consistent
- [ ] If two people change the same file (e.g., shared nav), talk first

---

## Deployment (Optional Stretch, Day 2 Late)

If time remains after demos:

- [ ] Connect repo to Vercel
- [ ] Set env vars (DATABASE_URL, Supabase keys)
- [ ] Deploy; visit production URL
- [ ] Gotcha: remember to add production URL to Supabase Auth redirect allowlist

If time doesn't remain, share written instructions via README.

---

## Success Criteria

### Day 1 — each participant has:

- [ ] Starter running locally with Prisma + Supabase connected
- [ ] Article CMS with working Create, Read, Update, Delete
- [ ] Cover image upload working
- [ ] At least one `revalidatePath` used and understood
- [ ] Zod validation errors surfacing in the form UI
- [ ] `useActionState` + `useFormStatus` wired on the create form

### Day 2 — each team has:

- [ ] Working auth (signup, login, protected routes, logout)
- [ ] All assigned modules reachable from the nav
- [ ] Cross-module integration working (project → its tasks, label filter → filtered tasks)
- [ ] Clean Git history with merges (not force-pushed chaos)
- [ ] At least a local demo; bonus if deployed to Vercel

---

## Instructor Prep Checklist

Before Day 1:

- [ ] Build the reference Article CMS end-to-end yourself (shakes out starter template bugs)
- [ ] Build the reference Task Tracker app end-to-end yourself (at minimum Modules A + B; C and D can be sketches)
- [ ] Test the starter repo clone → install → dev server flow from a fresh machine
- [ ] Prepare a throwaway Supabase project for each participant OR demo project that everyone clones — decide based on participant accounts
- [ ] Send pre-work email 3-5 days ahead
- [ ] Print or share Day 1 cheat sheet: key commands (`pnpm prisma db push`, `pnpm prisma studio`, `pnpm dev`), key imports

Before Day 2:

- [ ] Decide team composition (write it down)
- [ ] Pre-draft the Task Tracker schema on paper in case the participatory session stalls
- [ ] Have the Day 1 reference repo link ready to share

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Supabase signup / email confirmation blocks login during auth session | Disable email confirmation in Supabase dashboard for the training project, OR pre-create accounts |
| Someone's `DATABASE_URL` is wrong and nothing works | First action on Day 1: everyone runs `pnpm prisma db push` successfully before moving on |
| File upload fails due to bucket policy | Make `covers` bucket public; set permissive policies; revisit security as a post-training topic |
| One person on Module A can't finish → blocks everyone else | Instructor pairs with Module A person early. If hopeless, instructor takes over Module A and reassigns that person to help Module C |
| Time overrun on Day 1 session 4 (Server Actions) | Cut edit/delete in Session 5 to just edit; delete becomes homework reading |
| Day 2 teams have wildly different pace | Each instructor owns one team; don't switch mid-day |

---

## Post-Training Reading List (share at end of Day 2)

- Next.js docs: App Router, Caching, Data Fetching sections
- Prisma docs: Queries, Relations
- Supabase docs: Auth (SSR), Storage, Row Level Security (the part we skipped)
- React docs: "You Might Not Need an Effect" — actually read it
- Why Server Components exist (any of the Dan Abramov or Vercel team posts)
