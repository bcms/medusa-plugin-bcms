import {
  pickEntryTitle,
  serializeLink,
  serializeSetting,
} from "../utils"

describe("pickEntryTitle", () => {
  describe("parsed meta shape (object keyed by language)", () => {
    it("returns the english title when present", () => {
      const entry = {
        _id: "e1",
        meta: {
          en: { title: "Hello world", slug: "hello-world" },
          de: { title: "Hallo Welt", slug: "hallo-welt" },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Hello world")
    })

    it("honors an explicit language preference over english", () => {
      const entry = {
        _id: "e1",
        meta: {
          en: { title: "Hello world" },
          de: { title: "Hallo Welt" },
        },
      }
      expect(pickEntryTitle(entry, "de")).toBe("Hallo Welt")
    })

    it("falls back to the first language when english is missing", () => {
      const entry = {
        _id: "e1",
        meta: {
          fr: { title: "Bonjour le monde" },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Bonjour le monde")
    })

    it("matches en-US, en-GB, etc. as english", () => {
      const entry = {
        _id: "e1",
        meta: {
          "en-US": { title: "Howdy" },
          de: { title: "Hallo" },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Howdy")
    })

    it("checks alternative title-like keys when title is absent", () => {
      const entry = {
        _id: "e1",
        meta: {
          en: { headline: "Big Sale", slug: "big-sale" },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Big Sale")
    })

    it("falls back to the first non-empty string prop for unconventional templates", () => {
      const entry = {
        _id: "e1",
        meta: {
          en: { customField: "Some content", anotherField: "" },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Some content")
    })

    it("handles array-valued props (BCMS array=true) by taking the first string", () => {
      const entry = {
        _id: "e1",
        meta: {
          en: { title: ["Primary", "Secondary"] },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Primary")
    })

    it("skips empty string values when looking for a title", () => {
      const entry = {
        _id: "e1",
        meta: {
          en: { title: "", name: "Not empty" },
        },
      }
      expect(pickEntryTitle(entry)).toBe("Not empty")
    })
  })

  describe("raw meta shape (array of EntryMeta)", () => {
    it("supports the data-already-extracted shape", () => {
      const entry = {
        _id: "e1",
        meta: [{ lng: "en", data: { title: "Legacy title" } }],
      }
      expect(pickEntryTitle(entry)).toBe("Legacy title")
    })

    it("supports the props-array shape", () => {
      const entry = {
        _id: "e1",
        meta: [
          {
            lng: "en",
            props: [
              { id: "title", data: "Raw title" },
              { id: "slug", data: "raw-title" },
            ],
          },
        ],
      }
      expect(pickEntryTitle(entry)).toBe("Raw title")
    })
  })

  describe("fallbacks", () => {
    it("falls back to the entry slug when meta has no title-like prop", () => {
      const entry = {
        _id: "e1",
        slug: "some-slug",
        meta: { en: { unrelated: 42 } },
      }
      expect(pickEntryTitle(entry)).toBe("some-slug")
    })

    it("falls back to the entry _id when nothing else is available", () => {
      const entry = { _id: "abc123", meta: {} }
      expect(pickEntryTitle(entry)).toBe("abc123")
    })

    it("returns 'Untitled entry' for an entry with no identifying fields", () => {
      expect(pickEntryTitle({})).toBe("Untitled entry")
    })

    it("returns 'Untitled entry' for null/undefined entries", () => {
      expect(pickEntryTitle(null as any)).toBe("Untitled entry")
      expect(pickEntryTitle(undefined as any)).toBe("Untitled entry")
    })
  })
})

describe("serializeSetting", () => {
  it("preserves array fields and casts unknown values", () => {
    const out = serializeSetting({
      id: "set_1",
      enabled_templates: ["blog", "page"],
      default_slots: ["default", "rich"],
      last_test_at: "2026-01-01T00:00:00.000Z",
      last_test_status: "ok",
      last_test_message: "Connected",
    })

    expect(out.id).toBe("set_1")
    expect(out.enabled_templates).toEqual(["blog", "page"])
    expect(out.default_slots).toEqual(["default", "rich"])
    expect(out.slot_templates).toEqual({
      default: ["blog", "page"],
      rich: ["blog", "page"],
    })
    expect(out.last_test_at).toBe("2026-01-01T00:00:00.000Z")
    expect(out.last_test_status).toBe("ok")
    expect(out.last_test_message).toBe("Connected")
  })

  it("keeps default_slots empty when missing", () => {
    expect(
      serializeSetting({ id: "s", enabled_templates: [], default_slots: [] })
        .default_slots
    ).toEqual([])
    expect(
      serializeSetting({ id: "s", enabled_templates: [] }).default_slots
    ).toEqual([])
  })

  it("keeps per-slot template lists and derives the store allowlist", () => {
    const out = serializeSetting({
      id: "s",
      enabled_templates: ["stale"],
      default_slots: ["default", "quote"],
      slot_templates: {
        default: ["project"],
        quote: ["blog"],
      },
    })
    expect(out.slot_templates).toEqual({
      default: ["project"],
      quote: ["blog"],
    })
    expect(out.enabled_templates).toEqual(["project", "blog"])
  })

  it("normalizes nullable fields", () => {
    const out = serializeSetting({
      id: "s",
      enabled_templates: undefined,
    })
    expect(out.enabled_templates).toEqual([])
    expect(out.slot_templates).toEqual({})
    expect(out.last_test_at).toBeNull()
    expect(out.last_test_status).toBeNull()
    expect(out.last_test_message).toBeNull()
  })
})

describe("serializeLink", () => {
  it("preserves all fields with sensible defaults", () => {
    expect(
      serializeLink({
        id: "lnk_1",
        entry_id: "entry_1",
        template_name: "blog",
        slot: "rich",
        language: "en",
        position: 3,
        metadata: { foo: "bar" },
      })
    ).toEqual({
      id: "lnk_1",
      entry_id: "entry_1",
      template_name: "blog",
      slot: "rich",
      language: "en",
      position: 3,
      metadata: { foo: "bar" },
    })
  })

  it("applies defaults for slot, position and nullable fields", () => {
    expect(
      serializeLink({
        id: "lnk_2",
        entry_id: "entry_2",
        template_name: "page",
      })
    ).toEqual({
      id: "lnk_2",
      entry_id: "entry_2",
      template_name: "page",
      slot: "default",
      language: null,
      position: 0,
      metadata: null,
    })
  })
})
