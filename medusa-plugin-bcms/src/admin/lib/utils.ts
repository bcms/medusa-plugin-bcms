import type { BcmsEntrySummary } from "./types"

const TITLE_KEYS = ["title", "name", "label", "slug"]

export function entryTitle(
  entry: BcmsEntrySummary | null | undefined,
  language?: string | null
): string {
  if (!entry) return ""
  if (entry._resolved_title) return entry._resolved_title

  const meta = entry.meta
  if (Array.isArray(meta) && meta.length > 0) {
    const target =
      (language && meta.find((m) => m?.lng === language)) ||
      meta.find((m) => m?.lng?.startsWith("en")) ||
      meta[0]
    const data = target?.data ?? {}
    for (const key of TITLE_KEYS) {
      const value = data?.[key]
      if (typeof value === "string" && value.length > 0) {
        return value
      }
    }
  }
  if (typeof entry.slug === "string" && entry.slug.length > 0) {
    return entry.slug
  }
  return entry._id ?? entry.id ?? "Untitled entry"
}

export function entryId(entry: BcmsEntrySummary): string {
  return String(entry._id ?? entry.id ?? "")
}
