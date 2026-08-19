import { entryId, entryTitle } from "../utils"

describe("entryTitle", () => {
  it("prefers the server-supplied _resolved_title", () => {
    expect(
      entryTitle({
        _id: "e1",
        _resolved_title: "Server title",
        slug: "ignored",
      } as any)
    ).toBe("Server title")
  })

  it("falls back to slug then to id then to 'Untitled entry'", () => {
    expect(entryTitle({ _id: "e1", slug: "foo" } as any)).toBe("foo")
    expect(entryTitle({ _id: "abc" } as any)).toBe("abc")
    expect(entryTitle(undefined)).toBe("")
    expect(entryTitle(null)).toBe("")
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
