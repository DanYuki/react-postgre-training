import Link from "next/link"
import { detailArtikel } from "@/actions/articleAction"
import FormEditArtikel from "./FormEditArtikel"

interface Props {
    searchParams: Promise<{ id?: string }>
}

export default async function PageEditArtikel({ searchParams }: Props) {
    const { id } = await searchParams

    if (!id) return <p>Artikel tidak ditemukan.</p>

    const article = await detailArtikel(id)

    if (!article) return <p>Artikel tidak ditemukan.</p>

    return (
        <div>
            <Link href={`/articles/detail?id=${article.id}`} className="btn btn-accent mb-4">Kembali</Link>
            <FormEditArtikel article={article} />
        </div>
    )
}
