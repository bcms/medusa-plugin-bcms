import { z } from "zod"

export const ListBcmsTemplatesSchema = z.object({
  skip_cache: z
    .preprocess(
      (val) => (typeof val === "string" ? val === "true" : val),
      z.boolean()
    )
    .optional(),
})
export type ListBcmsTemplatesSchema = z.infer<typeof ListBcmsTemplatesSchema>

export const ListBcmsEntriesSchema = z.object({
  template: z.string().min(1, "template is required"),
  q: z.string().optional(),
  limit: z
    .preprocess(
      (val) => (typeof val === "string" ? Number.parseInt(val, 10) : val),
      z.number().int().min(1).max(100)
    )
    .optional(),
  offset: z
    .preprocess(
      (val) => (typeof val === "string" ? Number.parseInt(val, 10) : val),
      z.number().int().min(0)
    )
    .optional(),
  skip_cache: z
    .preprocess(
      (val) => (typeof val === "string" ? val === "true" : val),
      z.boolean()
    )
    .optional(),
})
export type ListBcmsEntriesSchema = z.infer<typeof ListBcmsEntriesSchema>

export const ListBcmsLinksSchema = z.object({
  product_id: z.string().min(1, "product_id is required"),
})
export type ListBcmsLinksSchema = z.infer<typeof ListBcmsLinksSchema>

export const CreateBcmsLinkSchema = z.object({
  product_id: z.string().min(1),
  entry_id: z.string().min(1),
  template_name: z.string().min(1),
  slot: z.string().min(1).optional(),
  language: z.string().min(1).nullable().optional(),
  position: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})
export type CreateBcmsLinkSchema = z.infer<typeof CreateBcmsLinkSchema>

export const UpdateBcmsLinkSchema = z.object({
  entry_id: z.string().min(1).optional(),
  template_name: z.string().min(1).optional(),
  slot: z.string().min(1).optional(),
  language: z.string().min(1).nullable().optional(),
  position: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})
export type UpdateBcmsLinkSchema = z.infer<typeof UpdateBcmsLinkSchema>

export const UpdateBcmsSettingSchema = z.object({
  enabled_templates: z.array(z.string().min(1)).optional(),
  default_slots: z.array(z.string().min(1)).optional(),
  auto_create_on_product: z.boolean().optional(),
})
export type UpdateBcmsSettingSchema = z.infer<typeof UpdateBcmsSettingSchema>
