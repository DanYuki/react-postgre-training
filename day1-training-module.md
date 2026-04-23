---
title: "Day 1: Building an Article CMS"
subtitle: "Next.js 16 · Prisma 7 · Supabase"
date: "2026"
---

# Day 1: Building an Article CMS

**Stack:** Next.js 16 · Prisma 7 · Supabase · DaisyUI · TypeScript  
**Format:** Instructor-led — everyone builds the same app together  
**End result:** Working CRUD app with cover image upload, running locally

---

## How to Use This Document

Read the concept explanation first. Understand what you're about to do and why. Then type the code. Resist the urge to copy-paste — the muscle memory matters.

Each code block shows the **filename** above it. When a line has `// ← add this`, it means that line is new — the surrounding lines are context.

---

# Session 1 — TypeScript Primer & React Mental Model Fix

*40 minutes*

## Why This Session Exists

You've shipped React before. But most of us learned by pattern-matching from docs and AI — we copy what works without understanding why. This session fixes the mental model before you build something real on top of it.

---

## TypeScript Micro-Primer

TypeScript is JavaScript with a type system bolted on. The goal isn't to be strict for its own sake — it's to catch entire classes of bugs before they reach runtime.

### `type` vs `interface`

Both describe the shape of an object. Pick one and stick with it. This codebase uses `type`.

```ts
// Both are valid — choose one convention
type Article = {
  id: string
  title: string
  body: string
}

interface Article {
  id: string
  title: string
  body: string
}
```

### Generics

Generics let you write code that works with multiple types without losing type information. You'll see them constantly in Next.js and React.

```ts
// Array<T> means "an array of T"
const ids: Array<string> = ['abc', 'def']

// Promise<T> means "a promise that resolves to T"
async function fetchUser(): Promise<User> { ... }
```

### Narrowing

TypeScript narrows types when you check for certain conditions. Early returns are the cleanest way to do this.

```ts
function getTitle(article: Article | null): string {
  if (!article) return 'No article'   // TypeScript now knows article is Article below
  return article.title
}
```

### Living With TypeScript Errors

Don't reach for `as any` when TypeScript complains. The error is usually telling you something real. Ask yourself: "What is TypeScript unsure about, and is it right to be unsure?"

---

## React Mental Model

### The Render Cycle

A React component is a function. When you call it, it returns JSX. React calls it again whenever:

1. Its **state** changes
2. Its **parent re-renders** (even if props haven't changed)

That's it. There's no magic — it's just a function being called.

### State Is a Snapshot

This is the most common source of bugs for intermediate React developers:

```tsx
// This does NOT increment by 2
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)  // count is still 0 here
    setCount(count + 1)  // count is STILL 0 — it's a snapshot
  }
}
```

When React calls your component function, `count` is a fixed value for that render. Calling `setCount` doesn't change `count` in the current render — it schedules a re-render with the new value.

To update based on previous state, use the updater function form:

```tsx
setCount(prev => prev + 1)  // always uses latest state
setCount(prev => prev + 1)  // now this works correctly
```

### State Updates Are Batched

React batches multiple `setState` calls within an event handler into a single re-render. This is a performance optimization — React waits until the event handler finishes before re-rendering.

### `useEffect` and Stale Closures

A stale closure happens when your effect captures an old value of a variable:

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    console.log(count)  // This always logs 0 — captured at mount
  }, 1000)
  return () => clearInterval(interval)
}, [])  // ← missing count in dependency array
```

Fix: include `count` in the dependency array.

### When NOT to Use `useEffect`

This is the most important thing to understand before touching Server Components.

**Don't use `useEffect` for:**

- **Derived state** — compute it during render instead
  ```tsx
  // Bad
  const [fullName, setFullName] = useState('')
  useEffect(() => { setFullName(`${first} ${last}`) }, [first, last])

  // Good
  const fullName = `${first} ${last}`
  ```

- **Fetching data on mount** — use Server Components instead (we'll see this in Session 2)

- **Responding to events** — use event handlers instead

`useEffect` is for synchronising with *external* systems (DOM APIs, third-party libraries, timers). If you're tempted to use it for anything else, there's usually a better way.

---

# Session 2 — Next.js App Router & Server Components

*60 minutes*

## App Router File Conventions

Next.js uses the file system as your router. Every folder inside `app/` maps to a URL segment. The files inside each folder control what happens at that route.

| File | Purpose |
|---|---|
| `page.tsx` | The UI for that route (publicly accessible) |
| `layout.tsx` | Wraps child routes — persists across navigations |
| `loading.tsx` | Shown as a Suspense fallback while the page loads |
| `error.tsx` | Error boundary for that route segment |
| `not-found.tsx` | Rendered when `notFound()` is called |

Let's create the articles list route:

```
app/
  page.tsx              → /
  articles/
    page.tsx            → /articles
    [id]/
      page.tsx          → /articles/abc123
```

### Dynamic Routes

Square brackets in a folder name create a dynamic segment. The value is available via `params`.

```
app/articles/[id]/page.tsx   → /articles/abc123
```

**Important — Next.js 16:** `params` is a Promise. You must `await` it.

```tsx
// app/articles/[id]/page.tsx
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params   // ← must await in Next.js 16
  // use id...
}
```

---

## Server Components vs Client Components

This is the most important concept in modern Next.js. Take your time here.

### Everything Is a Server Component by Default

In the App Router, every `page.tsx`, `layout.tsx`, and component you create is a **Server Component** unless you opt out. Server Components:

- Run only on the server
- Ship zero JavaScript to the browser
- Can be `async` — you can `await` inside the function body
- Can access databases, file systems, secrets directly
- **Cannot** use hooks (`useState`, `useEffect`, etc.)
- **Cannot** attach event handlers (`onClick`, `onChange`, etc.)
- **Cannot** use browser APIs (`window`, `localStorage`, etc.)

### Client Components

Add `'use client'` at the top of a file to make it a Client Component:

```tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

Client Components work like traditional React — they're pre-rendered on the server then hydrated (made interactive) in the browser.

### The Key Insight

You can read data in a Server Component, then pass it down to a Client Component as props. The Client Component receives it as serialisable data — no `useEffect` needed.

```tsx
// app/articles/page.tsx — Server Component
import { prisma } from '@/lib/prisma'
import { ArticleList } from '@/components/ArticleList'

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany()
  return <ArticleList articles={articles} />
}
```

```tsx
// components/ArticleList.tsx — Client Component (only if it needs interactivity)
'use client'

export function ArticleList({ articles }: { articles: Article[] }) {
  // can use hooks here if needed
  return <ul>...</ul>
}
```

### The Rule of Thumb

**Keep Server Components at the top. Push `'use client'` as far down the tree as possible.**

If a component only displays data, it should be a Server Component. Only reach for `'use client'` when you actually need interactivity (click handlers, forms with local state, browser APIs).

### The Composition Pattern

You can pass Server Components as `children` into Client Components:

```tsx
// Client Component — wraps server-rendered content
'use client'

export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div className="modal">{children}</div>}
    </>
  )
}
```

```tsx
// Server Component — uses the client wrapper
import { Modal } from '@/components/Modal'
import { ArticleDetail } from '@/components/ArticleDetail'

export default async function Page() {
  const article = await prisma.article.findFirst()
  return (
    <Modal>
      <ArticleDetail article={article} />  {/* Server Component as children */}
    </Modal>
  )
}
```

The `children` cross the boundary as already-rendered HTML — the Client Component doesn't need to know they were server-rendered.

---

## Exercise: First Server Component Route

Create the articles list page. For now, use static data — we'll connect the database in Session 3.

```tsx
// app/articles/page.tsx
export default function ArticlesPage() {
  const articles = [
    { id: '1', title: 'First Article' },
    { id: '2', title: 'Second Article' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Articles</h1>
      <ul className="space-y-2">
        {articles.map((article) => (
          <li key={article.id}>
            <a href={`/articles/${article.id}`} className="link link-primary">
              {article.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

Notice: this component is `async`-free for now — there's no database call yet. It's still a Server Component (no `'use client'`), just not an async one.

---

# Session 3 — Data Layer: Supabase + Prisma + First Read

*50 minutes*

## Setting Up Supabase

If you haven't already:

1. Create a project at [supabase.com](https://supabase.com)
2. Wait for it to provision (~1 minute)
3. Go to **Project Settings → Database → Connection string**

You need **two** connection strings. This confuses people — here's why they're different:

| Variable | URL | Why |
|---|---|---|
| `DATABASE_URL` | Transaction mode (port 6543) | Goes through PgBouncer pooler. Used at runtime by `PrismaClient`. |
| `DIRECT_URL` | Session mode (port 5432) | Direct to database. Used by the Prisma CLI for schema pushes (`db push`). |

Copy both into `.env`:

```bash
# .env  (both Next.js dev server and Prisma CLI read this automatically)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

> **Note:** We use `.env` (not `.env.local`) so both Next.js and the Prisma CLI can read it without extra configuration.

---

## The Prisma Schema — Prisma 7 Format

Open `prisma/schema.prisma`. In **Prisma 7**, the connection URL moved out of the schema and into `prisma.config.ts`. The schema now only declares the database provider and models:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  // No url here — Prisma 7 reads the connection URL from prisma.config.ts
}

generator client {
  provider = "prisma-client-js"
}

model Article {
  id             String   @id @default(cuid())
  title          String
  body           String
  coverImagePath String?    // ← the ? means nullable
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

And `prisma.config.ts` at the project root handles the CLI connection:

```ts
// prisma.config.ts
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),   // CLI uses the direct connection for schema operations
  },
})
```

Push the schema to Supabase:

```bash
npm run db:push
```

You should see: `Your database is now in sync with your Prisma schema.`

Open Prisma Studio to confirm the table exists:

```bash
npm run db:studio
```

Then seed some data:

```bash
npm run db:seed
```

---

## The Prisma Client Singleton — Prisma 7 Format

Open `lib/prisma.ts`. Prisma 7 requires a **driver adapter** — instead of its own query engine, Prisma delegates to a native database driver (`pg` for PostgreSQL):

```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,  // runtime uses pooler URL
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Why not just `new PrismaClient({ adapter })`?**

During development, Next.js uses Hot Module Replacement (HMR) — it re-executes your module files on every save. If `createPrismaClient()` ran on every save, you'd exhaust your database connection pool within minutes.

Storing the client on `globalThis` means HMR can discard and re-create the module, but the database connection survives.

In production, HMR doesn't run — so we don't bother storing on `globalThis` there.

**Why the adapter?** Prisma 7 removed its built-in Rust query engine and instead delegates to the native `pg` driver. This makes Prisma lighter and faster — it no longer ships a separate binary for each platform.

---

## First Database Query in a Server Component

Now make `app/articles/page.tsx` actually fetch from the database:

```tsx
// app/articles/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Link href="/articles/new" className="btn btn-primary btn-sm">
          New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-base-content/60">No articles yet.</p>
      ) : (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`/articles/${article.id}`}
                className="card bg-base-100 border border-base-200 hover:border-primary transition-colors"
              >
                <div className="card-body py-4">
                  <h2 className="font-semibold">{article.title}</h2>
                  <p className="text-sm text-base-content/60">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

Notice: the component is now `async`. The `await prisma.article.findMany()` call runs on the server — no API route, no `useEffect`, no loading state. Next.js renders the complete HTML with data and sends it to the browser.

**This is the moment.** For most people, this is when Server Components click.

---

## Article Detail Page

```tsx
// app/articles/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // ← Next.js 16: params is async

  const article = await prisma.article.findUnique({ where: { id } })

  if (!article) notFound()  // renders not-found.tsx (or Next.js default 404)

  return (
    <article className="prose max-w-none">
      <h1>{article.title}</h1>
      <pre className="whitespace-pre-wrap font-sans">{article.body}</pre>
    </article>
  )
}
```

The `whitespace-pre-wrap` preserves line breaks in the plain-text body without needing a rich text editor. Good enough for a CMS training.

Also create the not-found page:

```tsx
// app/articles/[id]/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
      <Link href="/articles" className="btn btn-ghost">
        Back to Articles
      </Link>
    </div>
  )
}
```

---

# Session 4 — Server Actions I: Creating an Article

*60 minutes*

## What Are Server Actions?

Server Actions (also called Server Functions) are async functions that run on the server. You define them with the `'use server'` directive and attach them to HTML forms via the `action` prop.

When a user submits the form, Next.js serialises the `FormData` and calls the server function. No API route needed. No `fetch()` on the client. No CORS. No JSON parsing.

```tsx
// Two ways to define a server action:

// 1. File-level directive — everything in this file is a server action
'use server'
export async function createArticle(formData: FormData) { ... }

// 2. Inline in a Server Component
export default function Page() {
  async function createArticle(formData: FormData) {
    'use server'
    // ...
  }
  return <form action={createArticle}>...</form>
}
```

We'll use the file-level approach to keep actions separate from UI.

---

## Create the New Article Form

First, the page (Server Component — the form `action` prop handles submission):

```tsx
// app/articles/new/page.tsx
import { createArticle } from './actions'
import { ArticleForm } from './ArticleForm'

export default function NewArticlePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">New Article</h1>
      <ArticleForm action={createArticle} />
    </div>
  )
}
```

The form itself needs `useActionState` and `useFormStatus` (React 19 hooks), so it must be a Client Component:

```tsx
// app/articles/new/ArticleForm.tsx
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type ActionState = {
  errors?: {
    title?: string[]
    body?: string[]
  }
} | null

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending}>
      {pending ? 'Saving...' : 'Create Article'}
    </Button>
  )
}

export function ArticleForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
}) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Title"
        name="title"
        id="title"
        required
        error={state?.errors?.title?.[0]}
      />

      <div className="form-control">
        <label htmlFor="body" className="label">
          <span className="label-text">Body</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          className={`textarea textarea-bordered w-full ${
            state?.errors?.body ? 'textarea-error' : ''
          }`}
          required
        />
        {state?.errors?.body && (
          <div className="label">
            <span className="label-text-alt text-error">
              {state.errors.body[0]}
            </span>
          </div>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
```

**`useActionState`** — takes the server action and an initial state. Returns `[state, formAction]`. When the action returns data (e.g. validation errors), it lands in `state`. The form re-renders automatically.

**`useFormStatus`** — must be used inside the `<form>`. The `pending` boolean is `true` while the action is running. Use it to disable the submit button.

---

## Add the Zod Schema

Open `lib/zod-schemas.ts` and add the article schema:

```ts
// lib/zod-schemas.ts
import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body: z.string().min(1, 'Body is required'),
})

export type ArticleInput = z.infer<typeof articleSchema>
```

---

## The Create Action

```ts
// app/articles/new/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { articleSchema } from '@/lib/zod-schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ActionState = {
  errors?: {
    title?: string[]
    body?: string[]
  }
} | null

export async function createArticle(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    title: formData.get('title'),
    body: formData.get('body'),
  }

  const result = articleSchema.safeParse(raw)

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  await prisma.article.create({ data: result.data })

  revalidatePath('/articles')
  redirect('/articles')
}
```

**Walk through each part:**

1. `formData.get('title')` — extracts the field value from the submitted form
2. `articleSchema.safeParse(raw)` — validates without throwing; returns `{ success, data, error }`
3. `result.error.flatten().fieldErrors` — converts Zod's error tree into `{ fieldName: string[] }`
4. `revalidatePath('/articles')` — tells Next.js to discard the cached render of `/articles` so the list re-fetches fresh data
5. `redirect('/articles')` — sends the user back to the list; this throws internally (don't wrap it in try/catch)

After creating an article, go back to `/articles` — the list updates without a manual refresh. This is what `revalidatePath` does.

---

# Session 5 — Server Actions II: Edit, Delete, Revalidation

*35 minutes*

## Edit Form

The edit page pre-fetches the article and passes its data as `defaultValue` props:

```tsx
// app/articles/[id]/edit/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateArticle } from './actions'
import { EditArticleForm } from './EditArticleForm'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Article</h1>
      <EditArticleForm article={article} action={updateArticle} />
    </div>
  )
}
```

```tsx
// app/articles/[id]/edit/EditArticleForm.tsx
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { Article } from '@prisma/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type ActionState = { errors?: { title?: string[]; body?: string[] } } | null

function SubmitButton() {
  const { pending } = useFormStatus()
  return <Button type="submit" loading={pending}>Save Changes</Button>
}

export function EditArticleForm({
  article,
  action,
}: {
  article: Article
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
}) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={article.id} />

      <Input
        label="Title"
        name="title"
        id="title"
        defaultValue={article.title}
        error={state?.errors?.title?.[0]}
      />

      <div className="form-control">
        <label htmlFor="body" className="label">
          <span className="label-text">Body</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          defaultValue={article.body}
          className="textarea textarea-bordered w-full"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
```

The `<input type="hidden" name="id" />` passes the article ID through the form submission so the action knows which record to update.

```ts
// app/articles/[id]/edit/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { articleSchema } from '@/lib/zod-schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ActionState = { errors?: { title?: string[]; body?: string[] } } | null

export async function updateArticle(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get('id') as string

  const result = articleSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  await prisma.article.update({
    where: { id },
    data: result.data,
  })

  revalidatePath('/articles')
  revalidatePath(`/articles/${id}`)  // ← invalidate the detail page too
  redirect(`/articles/${id}`)
}
```

---

## Delete

Add a delete form to the article detail page. The action is bound with `.bind()` so the ID is baked in — no hidden input needed:

```tsx
// In app/articles/[id]/page.tsx, add the delete form
import { deleteArticle } from './actions'

// Inside the component, after the article content:
const boundDelete = deleteArticle.bind(null, article.id)

// In JSX:
<form action={boundDelete}>
  <button
    type="submit"
    className="btn btn-error btn-sm"
    onClick={(e) => {
      if (!confirm('Delete this article?')) e.preventDefault()
    }}
  >
    Delete
  </button>
</form>
```

```ts
// app/articles/[id]/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } })
  revalidatePath('/articles')
  redirect('/articles')
}
```

**`deleteArticle.bind(null, article.id)`** — creates a new function with `id` pre-filled as the first argument. When the form submits, Next.js calls `deleteArticle('abc123')` — no FormData parsing needed for the ID.

---

## `revalidatePath` vs `revalidateTag`

| | `revalidatePath` | `revalidateTag` |
|---|---|---|
| **What it does** | Invalidates the cached render of a specific URL | Invalidates all cached data associated with a tag |
| **When to use** | You know exactly which page needs refreshing | Data is read across many different pages |
| **How to set up** | Nothing — just call it | You need to tag your data fetches with `{ next: { tags: ['articles'] } }` |

**Rule of thumb:** Start with `revalidatePath`. Reach for `revalidateTag` when you find yourself calling `revalidatePath` on 5+ different paths for the same data.

---

# Session 6 — File Upload + Wrap

*25 minutes*

## Supabase Storage Setup

1. Go to your Supabase dashboard → **Storage**
2. Click **New bucket**
3. Name it `covers`, check **Public bucket** (for training — in production you'd use signed URLs)
4. Create the bucket

---

## Add File Input to the Create Form

Update the form component to include a file input. The form must use a plain `<form>` (not a controlled component) — `encType` is handled automatically by the browser when a File is in the `FormData`.

```tsx
// app/articles/new/ArticleForm.tsx — add inside the form, before the SubmitButton

<div className="form-control">
  <label htmlFor="cover" className="label">
    <span className="label-text">Cover image (optional)</span>
  </label>
  <input
    type="file"
    id="cover"
    name="cover"
    accept="image/*"
    className="file-input file-input-bordered w-full"
  />
</div>
```

---

## Update the Create Action

```ts
// app/articles/new/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { articleSchema } from '@/lib/zod-schemas'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createArticle(
  _prevState: unknown,
  formData: FormData,
) {
  const result = articleSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  let coverImagePath: string | null = null

  const file = formData.get('cover') as File | null

  if (file && file.size > 0) {
    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      return { errors: { title: [], body: [], cover: ['File must be under 5 MB'] } }
    }
    if (!file.type.startsWith('image/')) {
      return { errors: { title: [], body: [], cover: ['File must be an image'] } }
    }

    const supabase = await createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('covers')
      .upload(path, file)

    if (error) {
      console.error('Upload failed:', error.message)
      return { errors: { title: [], body: [], cover: ['Upload failed'] } }
    }

    coverImagePath = path
  }

  await prisma.article.create({
    data: { ...result.data, coverImagePath },
  })

  revalidatePath('/articles')
  redirect('/articles')
}
```

---

## Render the Cover Image

In the article detail page, get the public URL from Supabase Storage and pass it to `next/image`:

```tsx
// app/articles/[id]/page.tsx — add cover image rendering
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

// Inside the component, after fetching the article:
let coverUrl: string | null = null

if (article.coverImagePath) {
  const supabase = await createClient()
  const { data } = supabase.storage
    .from('covers')
    .getPublicUrl(article.coverImagePath)
  coverUrl = data.publicUrl
}

// In JSX, before the article title:
{coverUrl && (
  <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden">
    <Image
      src={coverUrl}
      alt={`Cover for ${article.title}`}
      fill
      className="object-cover"
    />
  </div>
)}
```

**Why `next/image`?** It automatically optimises images — resizes, converts to WebP, lazy-loads. But it needs to know which hostnames are trusted (to prevent attackers from passing arbitrary URLs). The `next.config.ts` in the starter already has Supabase's hostname whitelisted.

---

## Server Actions vs Route Handlers

Before we wrap, a quick distinction:

| | Server Actions | Route Handlers (`route.ts`) |
|---|---|---|
| **Used for** | Form submissions, data mutations | Public HTTP endpoints, webhooks, third-party callbacks |
| **Called by** | Forms, client components | Fetch, external services |
| **Auth context** | Yes — can access cookies/session | Yes |
| **Streaming** | No | Yes |

**Rule:** If you're handling a form or a button click in your own app, use a Server Action. If a third-party service needs to POST to you (Stripe webhook, GitHub App callback), use a Route Handler.

---

## Day 1 Wrap

You've built a complete CRUD CMS with file upload. Here's what you used:

- **Server Components** — async data fetching directly in the component tree
- **Server Actions** — form handling without API routes
- **Prisma** — type-safe database queries
- **Zod** — runtime validation with automatic error formatting
- **`revalidatePath`** — cache invalidation after mutations
- **Supabase Storage** — file upload with public URLs
- **`useActionState` + `useFormStatus`** — React 19 primitives for action state and pending UI

Tomorrow: Supabase Auth, team project, same codebase — six people, six modules.

---

# Appendix A — Key Commands

```bash
npm run dev          # Start dev server
npm run db:push      # Sync prisma/schema.prisma → Supabase
npm run db:seed      # Insert sample articles
npm run db:studio    # Open Prisma Studio (localhost:5555)
npm run build        # Production build

npx prisma generate  # Regenerate client after schema changes
```

---

# Appendix B — Common Errors & Fixes

### "Cannot find module '@prisma/client'"

Run `npx prisma generate` to generate the client after schema changes. Also happens on first install.

### "The datasource property `url` is no longer supported in schema files"

You're using a Prisma 6 schema with Prisma 7. Remove `url` and `directUrl` from the `datasource db` block in `schema.prisma`. Connection URLs now live in `prisma.config.ts`.

### "Environment variable not found: DATABASE_URL"

You're missing `.env.local`. Copy `.env.example` → `.env.local` and fill in values. Note: `.env` (without local) is also read but should not be committed with secrets.

### "The `params` object is not a Promise" / TypeScript error on params

You're using an old type signature. In Next.js 16, `params` is `Promise<{ id: string }>`. Update the type and `await params`.

### "redirect() was called outside a try/catch block"

The opposite problem: `redirect()` throws a special exception — wrapping it in `try/catch` catches it and breaks the redirect. Don't wrap `redirect()` in try/catch.

### Upload fails with "new row violates row-level security policy"

Go to Supabase Dashboard → Storage → Policies and ensure your `covers` bucket has a permissive INSERT policy for training (you can tighten this in production). Alternatively: disable RLS on the storage bucket for the training project.

### Page doesn't update after mutation

You forgot to call `revalidatePath()`. Every mutation that should reflect in the UI needs a `revalidatePath('/the-route-to-refresh')` call before the `redirect()`.
