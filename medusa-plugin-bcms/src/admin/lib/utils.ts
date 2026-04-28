import type { BcmsEntrySummary } from "./types"

const TITLE_KEYS = [
  "title",
  "name",
  "label",
  "heading",
  "headline",
  "slug",
]

export function entryTitle(
  entry: BcmsEntrySummary | null | undefined,
  language?: string | null
): string {
  if (!entry) return ""
  if (entry._resolved_title) return entry._resolved_title

  const propsBag = pickPropsBag(entry.meta as any, language)
  if (propsBag) {
    for (const key of TITLE_KEYS) {
      const value = stringFromProp(propsBag[key])
      if (value) return value
    }
    for (const key of Object.keys(propsBag)) {
      const value = stringFromProp(propsBag[key])
      if (value) return value
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

function pickPropsBag(
  meta: any,
  language?: string | null
): Record<string, any> | null {
  if (!meta) return null

  if (Array.isArray(meta)) {
    const target =
      (language && meta.find((m: any) => m?.lng === language)) ||
      meta.find(
        (m: any) => typeof m?.lng === "string" && m.lng.startsWith("en")
      ) ||
      meta[0]
    if (!target) return null
    if (Array.isArray(target.props)) {
      const bag: Record<string, any> = {}
      for (const p of target.props) {
        if (p?.id) bag[p.id] = p.data
      }
      return bag
    }
    return target.data ?? null
  }

  if (typeof meta === "object") {
    if (language && meta[language]) return meta[language]
    const enKey = Object.keys(meta).find(
      (k) => typeof k === "string" && k.startsWith("en")
    )
    if (enKey) return meta[enKey]
    const firstKey = Object.keys(meta)[0]
    return firstKey ? meta[firstKey] : null
  }

  return null
}

function stringFromProp(value: any): string | null {
  if (typeof value === "string" && value.length > 0) return value
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === "string" && v.length > 0)
    if (typeof first === "string") return first
  }
  return null
}
