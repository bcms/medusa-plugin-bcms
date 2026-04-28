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

const TITLE_KEYS = [
  "title",
  "name",
  "label",
  "heading",
  "headline",
  "slug",
]

/**
 * Best-effort extraction of a human-readable title from a BCMS entry.
 *
 * Handles both shapes that the BCMS client may return:
 *   - parsed (default for `entry.getAll`):
 *       meta: { en: { title: "Foo", slug: "foo", ... }, de: { ... } }
 *   - raw / un-parsed:
 *       meta: [{ lng: "en", props: [{ id, data }] }]
 *
 * Looks at common title-like prop names first, then falls back to the first
 * non-empty string prop, then to the entry slug, then to its id.
 */
export function pickEntryTitle(
  entry: any,
  language?: string | null
): string {
  const propsBag = pickPropsBag(entry?.meta, language)
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
  if (typeof entry?.slug === "string" && entry.slug.length > 0) {
    return entry.slug
  }
  return entry?._id ?? entry?.id ?? "Untitled entry"
}

function pickPropsBag(
  meta: any,
  language?: string | null
): Record<string, any> | null {
  if (!meta) return null

  if (Array.isArray(meta)) {
    const target =
      (language && meta.find((m: any) => m?.lng === language)) ||
      meta.find((m: any) => typeof m?.lng === "string" && m.lng.startsWith("en")) ||
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
