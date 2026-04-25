"use client"

import { useActionState } from "react"
import { simpanArtikel, ActionResult } from "@/actions/articleAction"

const initialState: ActionResult = { success: false }

export default function FormBuatArtikel() {
    const [state, formAction, isPending] = useActionState(simpanArtikel, initialState)

    return (
        <form action={formAction}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend">New Article</legend>

                {state.error && (
                    <div className="alert alert-error text-sm mb-2">{state.error}</div>
                )}

                <label className="label">Judul</label>
                <input
                    type="text"
                    className={`input ${state.fieldErrors?.title ? "input-error" : ""}`}
                    placeholder="My awesome page"
                    name="title"
                />
                {state.fieldErrors?.title && (
                    <span className="text-error text-xs">{state.fieldErrors.title[0]}</span>
                )}

                <label className="label mt-2">Content</label>
                <textarea
                    name="content"
                    className={`textarea ${state.fieldErrors?.content ? "textarea-error" : ""}`}
                />
                {state.fieldErrors?.content && (
                    <span className="text-error text-xs">{state.fieldErrors.content[0]}</span>
                )}

                <button type="submit" className="btn btn-primary mt-4" disabled={isPending}>
                    {isPending ? "Menyimpan..." : "Submit"}
                </button>
            </fieldset>
        </form>
    )
}
