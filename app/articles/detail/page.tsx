import Link from 'next/link';
import { detailArtikel } from '@/actions/articleAction';

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function page({ searchParams }: Props) {
  const { id } = await searchParams;

  if (!id) return <p>Artikel tidak ditemukan.</p>

  const article = await detailArtikel(id)

  if (!article) return <p>Artikel tidak ditemukan.</p>

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <Link href="/articles" className="btn btn-accent">Kembali</Link>
        <Link href={`/articles/edit?id=${id}`} className="btn btn-warning">Edit</Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p>{article.body}</p>
    </div>
  )
}
