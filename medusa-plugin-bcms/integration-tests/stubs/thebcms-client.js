// Stub for `@thebcms/client` used by Jest during integration tests.
//
// The integration tests exercise the data layer of the BCMS module
// (`getOrCreateBcmsSetting`, auto-CRUD on `BcmsLink`/`BcmsSetting`) and
// never need to talk to a real BCMS instance. The real client transitively
// pulls in an ESM-only `uuid@13`, which Jest can't load through the dynamic
// `import()` calls Medusa's module loader uses. This stub short-circuits
// that resolution.
class Client {
  constructor() {}
  // Methods are stubbed lazily so any accidental call surfaces a clear error.
  get template() {
    return new Proxy(
      {},
      {
        get: () =>
          () => {
            throw new Error(
              "[integration-tests] BCMS Client.template was called but the client is stubbed."
            )
          },
      }
    )
  }
  get entry() {
    return new Proxy(
      {},
      {
        get: () =>
          () => {
            throw new Error(
              "[integration-tests] BCMS Client.entry was called but the client is stubbed."
            )
          },
      }
    )
  }
}

module.exports = { Client }
module.exports.default = { Client }
