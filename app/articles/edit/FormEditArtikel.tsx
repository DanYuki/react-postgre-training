"use client"

import { useActionState } from "react"
import { updateArtikel, ActionResult, Article } from "@/actions/articleAction"

const initialState: ActionResult = { success: false }

interface Props {
    article: Article
}

export default function FormEditArtikel({ article }: Props) {
    const [state, formAction, isPending] = useActionState(updateArtikel, initialState)

    return (
        <form action={formAction}>
            <input type="hidden" name="id" value={article.id} />

            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend">Edit Article</legend>

                {state.error && (
                    <div className="alert alert-error text-sm mb-2">{state.error}</div>
                )}

                <label className="label">Judul</label>
                <input
                    type="text"
                    className={`input ${state.fieldErrors?.title ? "input-error" : ""}`}
                    placeholder="My awesome page"
                    name="title"
                    defaultValue={article.title}
                />
                {state.fieldErrors?.title && (
                    <span className="text-error text-xs">{state.fieldErrors.title[0]}</span>
                )}

                <label className="label mt-2">Content</label>
                <textarea
                    name="content"
                    className={`textarea ${state.fieldErrors?.content ? "textarea-error" : ""}`}
                    defaultValue={article.body}
                />
                {state.fieldErrors?.content && (
                    <span className="text-error text-xs">{state.fieldErrors.content[0]}</span>
                )}

                <button type="submit" className="btn btn-warning mt-4" disabled={isPending}>
                    {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </fieldset>
        </form>
    )
}
