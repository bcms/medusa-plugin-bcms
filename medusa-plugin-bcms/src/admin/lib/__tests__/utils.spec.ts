import { entryId, entryTitle } from "../utils"

describe("entryTitle", () => {
  it("prefers the server-supplied _resolved_title", () => {
    expect(
      entryTitle({
        _id: "e1",
        _resolved_title: "Server title",
        meta: { en: { title: "Client-side title" } },
      } as any)
    ).toBe("Server title")
  })

  it("falls back to client-side extraction for parsed meta", () => {
    expect(
      entryTitle({
        _id: "e1",
        meta: { en: { title: "Client title" } },
      } as any)
    ).toBe("Client title")
  })

  it("supports legacy raw meta arrays", () => {
    expect(
      entryTitle({
        _id: "e1",
        meta: [{ lng: "en", data: { title: "Raw title" } }],
      } as any)
    ).toBe("Raw title")
  })

  it("falls back to slug then to id then to 'Untitled entry'", () => {
    expect(
      entryTitle({ _id: "e1", slug: "foo", meta: {} } as any)
    ).toBe("foo")
    expect(entryTitle({ _id: "abc" } as any)).toBe("abc")
    expect(entryTitle(undefined)).toBe("")
    expect(entryTitle(null)).toBe("")
  })

  it("respects explicit language preference", () => {
    expect(
      entryTitle(
        {
          _id: "e1",
          meta: { en: { title: "EN" }, de: { title: "DE" } },
        } as any,
        "de"
      )
    ).toBe("DE")
  })
})

describe("entryId", () => {
  it("prefers _id over id", () => {
    expect(entryId({ _id: "a", id: "b" } as any)).toBe("a")
  })

  it("falls back to id when _id is missing", () => {
    expect(entryId({ id: "b" } as any)).toBe("b")
  })

  it("returns an empty string when neither is present", () => {
    expect(entryId({} as any)).toBe("")
  })
})
