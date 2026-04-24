"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export default async function PageBuatArtikel() {
    // Buat function untuk handle input artikel
    async function simpanArtikel(formData: FormData) {
        "use server"
        // Insert data ke supabase
        await prisma.article.create({
            data: {
                body: formData.get('content') as string,
                title: formData.get('title') as string
            }
        })

        // Render lagi data pada halaman artikel
        revalidatePath("/articles")
        // Kembalikan user ke halaman daftar artikel
        redirect("/articles")
    }

    return (
        <div>
            <button className="btn btn-accent">Kembali</button>
            <form action={simpanArtikel}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                    <legend className="fieldset-legend">New Article</legend>

                    <label className="label">Judul</label>
                    <input type="text" className="input" placeholder="My awesome page" name="title" />

                    <label className="label">Content</label>
                    <textarea name="content" className="textarea"></textarea>

                    <button type="submit" className="btn btn-primary">Submit</button>
                </fieldset>
            </form>
        </div>
    )
}