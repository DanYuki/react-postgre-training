import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env' })

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.article.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-article-1',
        title: 'Getting Started with Server Components',
        body: `React Server Components let you write UI that renders entirely on the server. Unlike traditional React, there is no JavaScript sent to the browser for these components — just HTML.

This matters because large pages can be rendered without shipping the code to the client. You can read from a database directly inside a component body, just by making it async.

Here is a simple example:

async function ArticleList() {
  const articles = await prisma.article.findMany()
  return <ul>{articles.map(a => <li key={a.id}>{a.title}</li>)}</ul>
}

No useState. No useEffect. No fetch(). Just data.`,
      },
      {
        id: 'seed-article-2',
        title: 'Understanding Server Actions',
        body: `Server Actions are async functions that run on the server but can be called from the client. You define them with the "use server" directive and attach them to form elements via the action prop.

When a user submits a form, Next.js serialises the FormData and sends it to the server function — no API route required.

After the action runs, you call revalidatePath() to tell Next.js to refresh the cached data for a given URL. The page updates automatically.

This pattern replaces the traditional pattern of:
1. Writing a POST /api/articles endpoint
2. Fetching from the client with fetch()
3. Manually refreshing the UI

Server Actions make the code simpler and keep your secrets on the server.`,
      },
      {
        id: 'seed-article-3',
        title: 'Connecting Prisma to Supabase',
        body: `Supabase gives you a hosted PostgreSQL database with an auto-generated REST and GraphQL API. For this training, we use it as a plain PostgreSQL database and talk to it with Prisma.

You need two connection strings from the Supabase dashboard:

DATABASE_URL — the pooled connection string (Transaction mode, port 6543). Used at runtime by the PrismaClient adapter.

DIRECT_URL — the direct connection string (Session mode, port 5432). Used by the Prisma CLI for schema pushes and migrations, which require a persistent connection.

After setting both in .env, run:

  npm run db:push

This syncs your schema.prisma to the Supabase database without creating migration files — perfect for a training environment where you iterate quickly.`,
      },
    ],
  })

  console.log('Seeded 3 articles.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
