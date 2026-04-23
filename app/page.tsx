import Link from "next/link";

export default function Home() {
  return (
    <div className="hero min-h-[70vh]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Article CMS</h1>
          <p className="py-6 text-base-content/70">
            Day 1 starter — Next.js 16 · Prisma 7 · Supabase · DaisyUI
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/articles" className="btn btn-primary">
              View Articles
            </Link>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Next.js Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
