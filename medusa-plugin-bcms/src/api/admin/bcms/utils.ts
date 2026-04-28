import type { BcmsLinkPayload, BcmsSettingPayload } from "../../../modules/bcms/types"

export function serializeSetting(setting: any): BcmsSettingPayload {
  return {
    id: setting.id,
    enabled_templates: Array.isArray(setting.enabled_templates)
      ? (setting.enabled_templates as string[])
      : [],
    default_slots:
      Array.isArray(setting.default_slots) && setting.default_slots.length > 0
        ? (setting.default_slots as string[])
        : ["default"],
    auto_create_on_product: !!setting.auto_create_on_product,
    last_test_at: setting.last_test_at ?? null,
    last_test_status: (setting.last_test_status ?? null) as
      | "ok"
      | "error"
      | null,
    last_test_message: setting.last_test_message ?? null,
  }
}

export function serializeLink(link: any): BcmsLinkPayload {
  return {
    id: link.id,
    entry_id: link.entry_id,
    template_name: link.template_name,
    slot: link.slot ?? "default",
    language: link.language ?? null,
    position: typeof link.position === "number" ? link.position : 0,
    metadata: (link.metadata ?? null) as Record<string, unknown> | null,
  }
}

const TITLE_KEYS = ["title", "name", "label", "slug"]

/**
 * Best-effort extraction of a human-readable title from a parsed BCMS entry.
 * Falls back to the entry slug, then to its id.
 */
export function pickEntryTitle(
  entry: any,
  language?: string | null
): string {
  const meta = entry?.meta
  if (Array.isArray(meta) && meta.length > 0) {
    const target =
      (language && meta.find((m: any) => m?.lng === language)) ||
      meta.find((m: any) => m?.lng?.startsWith("en")) ||
      meta[0]
    const data = target?.data ?? {}
    for (const key of TITLE_KEYS) {
      const value = data?.[key]
      if (typeof value === "string" && value.length > 0) {
        return value
      }
    }
  }
  if (typeof entry?.slug === "string" && entry.slug.length > 0) {
    return entry.slug
  }
  return entry?._id ?? entry?.id ?? "Untitled entry"
}
