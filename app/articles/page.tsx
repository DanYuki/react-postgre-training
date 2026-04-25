import ArticleCard from "./ArticleCard";
import Link from "next/link";
import { getArticles, hapusArtikel } from "@/actions/articleAction";

export default async function ArticlePage() {
    const articles = await getArticles()

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Daftar Artikel</h1>

            <Link className="btn btn-primary" href="/articles/create">+ Tambah Artikel</Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} hapusArtikel={hapusArtikel} />
                ))}
            </div>
        </div>
    )
}
