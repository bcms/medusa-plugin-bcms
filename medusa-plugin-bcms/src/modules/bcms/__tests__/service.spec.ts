import BcmsModuleService from "../service"

describe("BcmsModuleService.validateOptions", () => {
  it("accepts an empty options object (no API key configured)", () => {
    expect(() => BcmsModuleService.validateOptions({})).not.toThrow()
  })

  it("accepts a string apiKey", () => {
    expect(() =>
      BcmsModuleService.validateOptions({ apiKey: "abc.def.ghi" })
    ).not.toThrow()
  })

  it("rejects non-string apiKey values", () => {
    expect(() =>
      BcmsModuleService.validateOptions({ apiKey: 123 as any })
    ).toThrow(/apiKey.*must be a string/)
    expect(() =>
      BcmsModuleService.validateOptions({ apiKey: {} as any })
    ).toThrow(/apiKey.*must be a string/)
  })
})
