# @thebcms/medusa-plugin

[Medusa v2](https://docs.medusajs.com/) plugin for [BCMS](https://thebcms.com).

Link BCMS entries to products by **slot** (e.g. `rich_description`, `recommended_blogs`), with per-slot template allowlists in admin, and serve resolved content through store API routes.

## Requirements

- Medusa `^2.19`
- Node `>=20.19.0`
- BCMS API key

## Install

```bash
npm install @thebcms/medusa-plugin
```

Register in `medusa-config.ts`:

```ts
import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  plugins: [
    {
      resolve: "@thebcms/medusa-plugin",
      options: {
        apiKey: process.env.BCMS_API_KEY,
      },
    },
  ],
})
```

Run migrations:

```bash
npx medusa db:migrate
```

### Options

| Option        | Type      | Default      | Description                                      |
| ------------- | --------- | ------------ | ------------------------------------------------ |
| `apiKey`      | `string`  | —            | BCMS API key (required for BCMS calls).          |
| `cmsOrigin`   | `string`  | BCMS default | Your BCMS instance URL.                          |
| `useMemCache` | `boolean` | `true`       | Client cache. Set `false` for live preview.      |
| `debug`       | `boolean` | `false`      | Verbose BCMS client logs.                        |

## Admin

- **Settings → BCMS** — define slots and which templates each slot may use. No slots exist until you add them. An empty template list on a slot means all templates are allowed.
- **Products → BCMS content** — link one or more BCMS entries per slot.

## Store API

Auth: Medusa publishable API key (via JS SDK).

| Method | Path                                   | Description                         |
| ------ | -------------------------------------- | ----------------------------------- |
| GET    | `/store/bcms/products/:id`             | Product + resolved entries in `bcms.slots`. |
| GET    | `/store/bcms/entries/:id?template=`    | Single entry by id.                 |
| GET    | `/store/bcms/pages/:slug?template=`    | Single entry by slug.               |

Standalone entry/page routes only allow templates configured on at least one slot (or all templates if any slot has an empty allowlist). Linked entries on the product route are always returned.

```ts
import Medusa from "@medusajs/js-sdk"

const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
})

const { product, bcms } = await sdk.client.fetch(
  `/store/bcms/products/${productId}`
)

const richText = bcms.slots["rich_description"]?.[0]?.entry
const blogs = bcms.slots["recommended_blogs"] ?? []
```

Query linked entries in custom routes:

```ts
const { data } = await query.graph({
  entity: "product",
  fields: ["id", "title", "bcms_links.*"],
  filters: { id: productId },
})
```

Types:

```ts
import type {
  BcmsModuleOptions,
  BcmsLinkPayload,
  BcmsSettingPayload,
} from "@thebcms/medusa-plugin/modules/bcms"
```

## Development

From the plugin directory:

```bash
npm install
npx medusa plugin:publish
npx medusa plugin:develop   # watch + rebuild
```

In your Medusa app:

```bash
npx medusa plugin:add @thebcms/medusa-plugin
npx medusa db:migrate
```

## License

[MIT](./LICENSE)
