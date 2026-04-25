"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createArticleSchema, deleteArticleSchema } from "@/lib/zod-schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface Article {
  id: string
  title: string
  body: string
  coverImagePath: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ActionResult {
  success: boolean
  error?: string
  fieldErrors?: {
    title?: string[]
    content?: string[]
  }
}

export async function getArticles(): Promise<Article[]> {
  return prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function simpanArtikel(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = createArticleSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten()
    return {
      success: false,
      error: "Periksa kembali isian form kamu.",
      fieldErrors: {
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
    }
  }

  await prisma.article.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.content,
    },
  })

  revalidatePath("/articles")
  redirect("/articles")
}

export async function hapusArtikel(id: string): Promise<void> {
  const parsed = deleteArticleSchema.safeParse({ id })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await prisma.article.delete({ where: { id: parsed.data.id } })
  revalidatePath("/articles")
  redirect("/articles")
}
