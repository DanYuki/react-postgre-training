"use client"

import type { Article } from "@/actions/articleAction"
import { useRouter } from "next/navigation"

interface ArticleCardProps {
    article: Article
    hapusArtikel: (id: string) => void
}

export default function ArticleCard({ article, hapusArtikel }: ArticleCardProps) {
    const router = useRouter();

    const pindahDetail = (id: string) => {
        router.push(`/articles/detail?id=${id}`)
    }

    return (
        <div className="card bg-base-100 shadow-sm">
            <figure>
                <img
                    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                    alt="Cover" />
            </figure>
            <div className="card-body">
                <h2 className="card-title truncate">{article.title}</h2>
                <p className="line-clamp-2">{article.body}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary" onClick={() => pindahDetail(article.id)}>Baca</button>
                    <button className="btn btn-error" onClick={() => hapusArtikel(article.id)}>Hapus</button>
                </div>
            </div>
        </div>
    )
}
