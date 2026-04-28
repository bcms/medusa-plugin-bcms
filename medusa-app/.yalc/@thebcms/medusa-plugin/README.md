# @thebcms/medusa-plugin

Standalone [Medusa v2](https://docs.medusajs.com/) plugin that integrates [BCMS](https://thebcms.com), the headless CMS.

It lets merchants:

- Pick which BCMS templates can be attached to Medusa entities (server-side, persisted in the database).
- Attach **multiple BCMS entries per product**, grouped by **slot** (e.g. `default`, `rich_description`, `recommended_blogs`).
- Read those entries fully resolved through a Storefront API endpoint, so a Next.js frontend can render BCMS rich text or a list of recommended blog posts under any product.

## Status

`v0.1.0` — first standalone release. Single-product slot model, settings persisted in DB, storefront read endpoints, multi-entry widget.

## Requirements

- Medusa `^2.12`
- Node 20+
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
        // useMemCache: true,
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
| `useMemCache` | `boolean` | `false`                       | Enable in-memory caching in the BCMS client.                         |
| `debug`       | `boolean` | `false`                       | Verbose BCMS client logs.                                            |

## Admin UX

After registering the plugin, you'll find:

- **Settings → BCMS** — `http://localhost:9000/app/settings/bcms`
  - Connection badge + "Test connection" button.
  - Multi-select of BCMS templates that should be available on resources.
  - Slot manager (`default` is always present; add named slots like `recommended_blogs`).
- **Products → [any product] → "BCMS content" widget**
  - One section per slot defined in Settings.
  - Pick BCMS entries with debounced template + search dropdowns.
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
| GET    | `/store/bcms/products/:id`                       | Medusa product + resolved BCMS entries grouped by slot.  |
| GET    | `/store/bcms/entries/:id?template=NAME`          | Single BCMS entry by id.                                 |
| GET    | `/store/bcms/pages/:slug?template=NAME`          | Single BCMS entry by slug (great for blog posts/pages).  |

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
    links: Array<{
      id: string
      slot: string
      entry: any | null
      template_name: string
    }>
    by_slot: Record<string, Array<{ entry: any | null }>>
  }
}

const { product, bcms } = await sdk.client.fetch<ProductWithBcms>(
  `/store/bcms/products/${productId}`
)

const richText = bcms.by_slot["rich_description"]?.[0]?.entry
const recommendedBlogs = bcms.by_slot["recommended_blogs"] ?? []
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

## Migrating from `medusa-plugin-bcms` (pre-0.1.0)

Earlier prototype versions stored the BCMS mapping on `product.metadata.bcms_entry`. This release replaces that with a proper data model and module link, so the metadata mapping is **not** automatically migrated. Re-link your products through the new product widget after upgrading.

## License

[MIT](./LICENSE)
