import {
  deriveEnabledTemplates,
  normalizeSlots,
  normalizeSlotTemplates,
  resolveSlotSettings,
} from "../settings-utils"

describe("normalizeSlots", () => {
  it("returns an empty list when the value is empty or invalid", () => {
    expect(normalizeSlots([])).toEqual([])
    expect(normalizeSlots(undefined)).toEqual([])
    expect(normalizeSlots("default")).toEqual([])
  })

  it("keeps named slots in order", () => {
    expect(normalizeSlots(["rich_description", "quote"])).toEqual([
      "rich_description",
      "quote",
    ])
  })
})

describe("normalizeSlotTemplates", () => {
  it("copies the global allowlist onto every slot when the map is missing", () => {
    expect(
      normalizeSlotTemplates(
        ["default", "quote"],
        undefined,
        ["blog", "page"]
      )
    ).toEqual({
      default: ["blog", "page"],
      quote: ["blog", "page"],
    })
  })

  it("starts a newly added slot with an empty list", () => {
    expect(
      normalizeSlotTemplates(["default", "quote"], { default: ["project"] })
    ).toEqual({
      default: ["project"],
      quote: [],
    })
  })

  it("drops keys that are no longer slots", () => {
    expect(
      normalizeSlotTemplates(["default"], {
        default: ["project"],
        quote: ["blog"],
      })
    ).toEqual({ default: ["project"] })
  })
})

describe("deriveEnabledTemplates", () => {
  it("returns [] when any slot allows every template", () => {
    expect(
      deriveEnabledTemplates({ default: ["project"], quote: [] })
    ).toEqual([])
  })

  it("returns the unique union when every slot is restricted", () => {
    expect(
      deriveEnabledTemplates({
        default: ["project", "studio"],
        quote: ["blog"],
      })
    ).toEqual(["project", "studio", "blog"])
  })
})

describe("resolveSlotSettings", () => {
  it("fills missing slot_templates from enabled_templates", () => {
    expect(
      resolveSlotSettings({
        default_slots: ["default", "quote"],
        enabled_templates: ["blog", "page"],
      })
    ).toEqual({
      default_slots: ["default", "quote"],
      slot_templates: {
        default: ["blog", "page"],
        quote: ["blog", "page"],
      },
      enabled_templates: ["blog", "page"],
    })
  })

  it("derives enabled_templates from per-slot lists", () => {
    expect(
      resolveSlotSettings({
        default_slots: ["default", "quote"],
        slot_templates: {
          default: ["project"],
          quote: ["blog"],
        },
      })
    ).toEqual({
      default_slots: ["default", "quote"],
      slot_templates: {
        default: ["project"],
        quote: ["blog"],
      },
      enabled_templates: ["project", "blog"],
    })
  })
})
