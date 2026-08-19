function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0
  )
}

export function normalizeSlots(slots: unknown): string[] {
  return asStringList(slots)
}

export function normalizeSlotTemplates(
  slots: string[],
  map: unknown,
  fallbackTemplates: string[] = []
): Record<string, string[]> {
  const hasMap = !!map && typeof map === "object" && !Array.isArray(map)
  const src = hasMap ? (map as Record<string, unknown>) : {}
  const fallback = asStringList(fallbackTemplates)

  const out: Record<string, string[]> = {}
  for (const slot of slots) {
    const raw = src[slot]
    if (Array.isArray(raw)) {
      out[slot] = asStringList(raw)
    } else if (!hasMap) {
      out[slot] = [...fallback]
    } else {
      out[slot] = []
    }
  }
  return out
}

export function deriveEnabledTemplates(
  slotTemplates: Record<string, string[]>
): string[] {
  const lists = Object.values(slotTemplates)
  if (lists.length === 0 || lists.some((list) => list.length === 0)) {
    return []
  }
  return Array.from(new Set(lists.flat()))
}

export function resolveSlotSettings(setting: {
  default_slots?: unknown
  slot_templates?: unknown
  enabled_templates?: unknown
}) {
  const default_slots = normalizeSlots(setting.default_slots)
  const slot_templates = normalizeSlotTemplates(
    default_slots,
    setting.slot_templates,
    asStringList(setting.enabled_templates)
  )
  return {
    default_slots,
    slot_templates,
    enabled_templates: deriveEnabledTemplates(slot_templates),
  }
}
