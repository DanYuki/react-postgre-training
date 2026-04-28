import { z } from 'zod'

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul terlalu panjang'),
  content: z.string().min(1, 'Konten wajib diisi'),
})

export const deleteArticleSchema = z.object({
  id: z.string().min(1, 'ID artikel tidak valid'),
})

export const updateArticleSchema = z.object({
  id: z.string().min(1, 'ID artikel tidak valid'),
  title: z.string().min(1, 'Judul wajib diisi').max(255, 'Judul terlalu panjang'),
  content: z.string().min(1, 'Konten wajib diisi'),
})

export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type DeleteArticleInput = z.infer<typeof deleteArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
