"use client"

import { OIDCDiscoveryDocument } from "@supabase/supabase-js"

interface Article {
    id: string,
    title: string,
    body: string,
    createdAt: string | "",
    updatedAt: string | "",
    coverUrl: string | "",
}

interface ArticleCardProps {
    article: Article,
    hapusArtikel: (id: string) => void,
}

export default function ArticleCard({article, hapusArtikel} : ArticleCardProps) {

    return (
        <div className="card bg-base-100 shadow-sm" key={article.id}>
            <figure>
                <img
                    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                    alt="Shoes" />
            </figure>
            <div className="card-body">
                <h2 className="card-title truncate">{article.title}</h2>
                <p className="line-clamp-2">A card component has a figure, a body part, and inside body there are title and actions parts</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">Buy Now</button>
                    <button className="btn btn-error" onClick={() => hapusArtikel(article.id)}>Delete</button>
                </div>
            </div>
        </div>
    )
}