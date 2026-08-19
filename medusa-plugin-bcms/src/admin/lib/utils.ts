import type { BcmsEntrySummary } from "./types"

export function entryTitle(
  entry: BcmsEntrySummary | null | undefined
): string {
  if (!entry) return ""
  if (entry._resolved_title) return entry._resolved_title
  if (typeof entry.slug === "string" && entry.slug.length > 0) {
    return entry.slug
  }
  return entry._id ?? entry.id ?? "Untitled entry"
}

export function entryId(entry: BcmsEntrySummary): string {
  return String(entry._id ?? entry.id ?? "")
}
