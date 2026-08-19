class Client {
  constructor() {}
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
