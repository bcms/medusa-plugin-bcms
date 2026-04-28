/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  roots: ["<rootDir>/src", "<rootDir>/integration-tests"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
  // Default to unit-test paths; override via CLI arg for integration tests.
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.medusa/",
  ],
  // `@thebcms/client` ships .cjs entry files that `require("uuid")`, but
  // hoisted `uuid@13` is ESM-only. The real client is never exercised by
  // tests (we cover its consumers, not BCMS itself), so we redirect the
  // import to a tiny stub. This sidesteps the Jest/CJS-vs-ESM headache
  // entirely for both unit and integration tests.
  moduleNameMapper: {
    "^@thebcms/client$":
      "<rootDir>/integration-tests/stubs/thebcms-client.js",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true, decorators: true },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
            react: {
              runtime: "automatic",
            },
          },
          target: "es2021",
        },
        sourceMaps: "inline",
      },
    ],
  },
  // Integration tests need DB setup time; unit tests stay snappy.
  testTimeout: 60_000,
}
