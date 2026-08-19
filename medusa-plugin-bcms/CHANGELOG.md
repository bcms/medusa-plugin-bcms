# Changelog

All notable changes to `@thebcms/medusa-plugin` are documented in this file.

## 0.1.0 — 2026-08-19

First public release. Link BCMS entries to Medusa products (multiple entries per slot) and serve them through admin and store APIs.

- Settings stored as a singleton `bcms_setting` row (`bcms_setting_singleton`).
- Product widget: pick templates and entries, grouped by named slots. Each slot has its own template allowlist.
- Store: `GET /store/bcms/products/:id` resolves linked entries into `bcms.slots`; `GET /store/bcms/entries/:id` and `GET /store/bcms/pages/:slug` read a single entry when the template is assigned to a slot (or when any slot still allows every template).
- In-memory BCMS client cache is on by default (`useMemCache: true`). Set `false` for live preview.
- Requires Medusa `^2.19` and Node `>=20.19.0`.
