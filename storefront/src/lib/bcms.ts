import type { BcmsEntry, BcmsLink, ProductWithBcms } from "./types"

export function localeMeta(entry: BcmsEntry | null | undefined, lng = "en") {
  if (!entry?.meta) return {}
  return entry.meta[lng] ?? entry.meta.en ?? Object.values(entry.meta)[0] ?? {}
}

export function localeContent(entry: BcmsEntry | null | undefined, lng = "en") {
  if (!entry?.content) return []
  const nodes = entry.content[lng] ?? entry.content.en
  return Array.isArray(nodes) ? nodes : []
}

function isResolvedEntry(value: unknown): value is BcmsEntry {
  return (
    !!value &&
    typeof value === "object" &&
    "_id" in value &&
    ("templateName" in value || "meta" in value)
  )
}

function collapseEntry(entry: BcmsEntry) {
  const meta = localeMeta(entry)
  return {
    _id: entry._id,
    templateName: entry.templateName,
    title: meta.title ?? null,
    slug: meta.slug ?? null,
  }
}

function collapseValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated]"
  if (Array.isArray(value)) {
    return value.map((item) => collapseValue(item, depth + 1))
  }
  if (isResolvedEntry(value) && depth > 0) {
    return collapseEntry(value)
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value)) {
      out[key] = collapseValue(nested, depth + 1)
    }
    return out
  }
  return value
}

/**
 * Same shape Medusa returns, with nested entry pointers collapsed to
 * `{_id, templateName, title, slug}` so the JSON inspector stays readable.
 * The live `/store/bcms/products/:id` response fully expands those pointers.
 */
export function previewPayload(data: ProductWithBcms) {
  const previewLinks = (links: BcmsLink[]) =>
    links.map((link) => ({
      id: link.id,
      slot: link.slot,
      position: link.position,
      language: link.language,
      entry_id: link.entry_id,
      template_name: link.template_name,
      error: link.error,
      entry: link.entry
        ? collapseValue({ ...link.entry }, 0)
        : null,
    }))

  return {
    product: data.product,
    bcms: {
      slots: Object.fromEntries(
        Object.entries(data.bcms.slots).map(([slot, links]) => [
          slot,
          previewLinks(links),
        ])
      ),
    },
  }
}

export function richTextHtml(value: unknown): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(richTextHtml).join("")
  if (typeof value === "object" && value && "nodes" in value) {
    return richTextHtml((value as { nodes: unknown }).nodes)
  }
  if (typeof value === "object" && value && "value" in value) {
    const inner = (value as { value: unknown }).value
    return typeof inner === "string" ? inner : ""
  }
  return ""
}
