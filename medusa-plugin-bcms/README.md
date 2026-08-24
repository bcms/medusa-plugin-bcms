# @thebcms/medusa-plugin

Standalone [Medusa v2](https://docs.medusajs.com/) plugin that integrates [BCMS](https://thebcms.com), the headless CMS.

It lets merchants:

- Pick which BCMS templates can be attached to **products**, per slot (server-side, persisted in the database). Collections, categories, and other entities are not linked in this release.
- Attach **multiple BCMS entries per product**, grouped by **slot** (e.g. `rich_description`, `recommended_blogs`).
- Read those entries fully resolved through a Storefront API endpoint, so a Next.js frontend can render BCMS rich text or a list of recommended blog posts under any product.

## Status

`v0.1.0` — first standalone release. Products-only slot model, settings persisted in DB, storefront read endpoints, multi-entry widget.

## Requirements

- Medusa `^2.19`
- Node `>=20.19.0` (or `^22.12`)
- A BCMS instance with an API key

## Install

When the plugin is published to npm:

```bash
npm install @thebcms/medusa-plugin
```

For local development, follow the [Local Development](#local-development) section.

## Configure

Add the plugin to `medusa-config.ts`:

```ts
import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "@thebcms/medusa-plugin",
      options: {
        apiKey: process.env.BCMS_API_KEY,
        // optional:
        // cmsOrigin: "https://app.thebcms.com",
        // useMemCache: false, // default is true; set false for live preview
        // debug: false,
      },
    },
  ],
})
```

After installing or upgrading, run migrations to create the plugin's tables (`bcms_link`, `bcms_setting`) and the `product` ↔ `bcms_link` module link table:

```bash
npx medusa db:migrate
```

### Plugin options

| Option        | Type      | Default                       | Description                                                          |
| ------------- | --------- | ----------------------------- | -------------------------------------------------------------------- |
| `apiKey`      | `string`  | —                             | BCMS API key. The plugin loads without one but BCMS calls will fail. |
| `cmsOrigin`   | `string`  | BCMS default                  | Origin of your BCMS instance.                                        |
| `useMemCache` | `boolean` | `true`                        | In-memory cache in the BCMS client. Set `false` for live preview.    |
| `debug`       | `boolean` | `false`                       | Verbose BCMS client logs.                                            |

## Admin UX

After registering the plugin, you'll find:

- **Settings → BCMS** — `http://localhost:9000/app/settings/bcms`
  - Connection badge + "Test connection" button.
  - Slot manager: add named slots (e.g. `recommended_blogs`), each with its own template allowlist. Leave every template unchecked in a slot to allow all of them. There are no slots until you add one.
- **Products → [any product] → "BCMS content" widget**
  - One section per slot defined in Settings.
  - Pick from that slot's templates, then pick an entry by title.
  - Multiple entries per slot, removable individually.

## API

### Admin (auth: standard Medusa admin)

| Method | Path                              | Description                                       |
| ------ | --------------------------------- | ------------------------------------------------- |
| GET    | `/admin/bcms/settings`            | Read DB-backed settings + connection status.      |
| POST   | `/admin/bcms/settings`            | Update settings (uses `updateBcmsSettingWorkflow`). |
| POST   | `/admin/bcms/test-connection`     | Test BCMS connectivity, persist last-test info.   |
| GET    | `/admin/bcms/templates`           | List BCMS templates.                              |
| GET    | `/admin/bcms/entries?template=`   | List all entries in a BCMS template.              |
| GET    | `/admin/bcms/links?product_id=`   | List BCMS links for a product.                    |
| POST   | `/admin/bcms/links`               | Link an entry to a product (`createProductBcmsLinkWorkflow`). |
| POST   | `/admin/bcms/links/:id`           | Update an existing link (`updateBcmsLinkWorkflow`). |
| DELETE | `/admin/bcms/links/:id?product_id=` | Unlink (`deleteProductBcmsLinkWorkflow`).       |

### Store (auth: publishable API key, handled by the Medusa JS SDK)

| Method | Path                                            | Description                                              |
| ------ | ----------------------------------------------- | -------------------------------------------------------- |
| GET    | `/store/bcms/products/:id`                       | Medusa product + resolved BCMS entries in `bcms.slots`.  |
| GET    | `/store/bcms/entries/:id?template=NAME`          | Single BCMS entry by id.                                 |
| GET    | `/store/bcms/pages/:slug?template=NAME`          | Single BCMS entry by slug (great for blog posts/pages).  |

`GET /store/bcms/entries/:id` and `GET /store/bcms/pages/:slug` only resolve templates assigned to at least one slot. If any slot still allows every template (its list is empty), every template is allowed. A request for a template outside the allowlist returns **404**. Product-linked entries on `/store/bcms/products/:id` are always returned — they were already chosen in admin.

#### Storefront example (Next.js)

```ts
import Medusa from "@medusajs/js-sdk"

const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
})

type ProductWithBcms = {
  product: { id: string; title: string; description: string | null }
  bcms: {
    slots: Record<
      string,
      Array<{
        id: string
        slot: string
        entry: any | null
        template_name: string
      }>
    >
  }
}

const { product, bcms } = await sdk.client.fetch<ProductWithBcms>(
  `/store/bcms/products/${productId}`
)

const richText = bcms.slots["rich_description"]?.[0]?.entry
const recommendedBlogs = bcms.slots["recommended_blogs"] ?? []
```

## Module link & Query

The plugin defines:

```ts
defineLink(ProductModule.linkable.product, {
  linkable: BcmsModule.linkable.bcmsLink,
  isList: true,
  deleteCascade: true,
})
```

So you can read links through Medusa Query in your own custom routes:

```ts
const { data: products } = await query.graph({
  entity: "product",
  fields: ["id", "title", "bcms_links.*"],
  filters: { id: productId },
})
```

## Importing types in your app

```ts
import type {
  BcmsModuleOptions,
  BcmsLinkPayload,
  BcmsSettingPayload,
  BcmsConnectionStatus,
} from "@thebcms/medusa-plugin/modules/bcms"
```

## Local development

This plugin uses Medusa's standard plugin development flow.

1. Install:

   ```bash
   cd medusa-plugin-bcms
   npm install
   ```

2. Publish to the local Yalc registry:

   ```bash
   npx medusa plugin:publish
   ```

3. In your Medusa application, add it:

   ```bash
   cd medusa-app
   npx medusa plugin:add @thebcms/medusa-plugin
   ```

4. Run database migrations and start dev:

   ```bash
   npx medusa db:migrate
   npm run dev
   ```

5. Watch plugin source for changes (rebuilds + republishes on save):

   ```bash
   cd medusa-plugin-bcms
   npx medusa plugin:develop
   ```

## Testing

The plugin ships with a Jest setup based on `@medusajs/test-utils`.

```bash
# Unit tests (pure functions; no DB required)
npm test

# Module integration tests (real Postgres + per-worker test databases)
DB_HOST=localhost \
DB_USERNAME=postgres \
DB_PASSWORD=postgres \
npm run test:integration:modules

# Full local CI parity: typecheck + unit tests
npm run test:ci
```

The integration suite uses `moduleIntegrationTestRunner` and creates one
database per Jest worker, so the connecting Postgres user must have
`CREATEDB` (the `postgres` superuser does by default). On a fresh local
Postgres, run the plugin once with `npm run build` first — the runner
loads the compiled module from `.medusa/server/...`.

A GitHub Actions workflow at `.github/workflows/ci.yml` runs the
typecheck → unit tests → plugin build pipeline on every push, plus the
module integration tests in a job with a Postgres service container.

## Smoke test (before publishing)

Use the host app in this repo (`medusa-app/`) against Medusa 2.19:

```bash
cd medusa-plugin-bcms
npx medusa plugin:publish

cd ../medusa-app
npx medusa plugin:add @thebcms/medusa-plugin
npx medusa db:migrate
npm run dev
```

Confirm:

- Settings → BCMS: connection test, per-slot templates.
- Product detail: link and unlink entries per slot.
- `GET /store/bcms/products/:id` with a publishable API key.
- With every slot restricted to an allowlist, `GET /store/bcms/entries/:id?template=` for a template on none of those lists returns 404.

## Publish to npm

This package is scoped (`@thebcms/...`). You need publish rights on the `@thebcms` npm org.

1. The GitHub repo is [bcms/medusa-plugin-bcms](https://github.com/bcms/medusa-plugin-bcms). CI lives in `medusa-plugin-bcms/.github/workflows/ci.yml`. Do not publish the host app.
2. `npm login` as a member of `@thebcms`.
3. Build and publish:

```bash
cd medusa-plugin-bcms
npx medusa plugin:build
npm publish --access public
```

`prepublishOnly` already runs `plugin:build`. After publish, Medusa scrapes npm for the `medusa-v2` / `medusa-plugin-cms` keywords; listing on [medusajs.com/integrations](https://medusajs.com/integrations) can take about a week.

## Migrating from `medusa-plugin-bcms` (pre-0.1.0)

Earlier prototype versions stored the BCMS mapping on `product.metadata.bcms_entry`. This release replaces that with a proper data model and module link, so the metadata mapping is **not** automatically migrated. Re-link your products through the new product widget after upgrading.

## License

[MIT](./LICENSE)
