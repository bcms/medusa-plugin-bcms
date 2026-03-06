# Medusa Plugin BCMS

BCMS integration for Medusa – headless CMS content in your store. This plugin exposes **mocked** BCMS data via Store and Admin API routes so you can develop and test without a live BCMS instance.

## Features

- **Store API** – Fetch BCMS content from your storefront (entries, pages, content types).
- **Admin API** – BCMS overview and content for the Medusa Admin.
- **Mocked data** – Content types, entries, and pages are mocked; replace with real BCMS API calls when you integrate.

## API Routes (mocked)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/store/bcms` | BCMS overview (counts) |
| GET | `/store/bcms/content-types` | List content types |
| GET | `/store/bcms/entries` | List entries (optional: `content_type`, `locale`, `status`) |
| GET | `/store/bcms/entries/:id` | Get entry by id |
| GET | `/store/bcms/pages` | List pages (optional: `locale`, `status`) |
| GET | `/store/bcms/pages/:slug` | Get page by slug |
| GET | `/admin/bcms` | Admin BCMS overview |

## Setup

### 1. Publish the plugin locally

From this plugin directory:

```bash
npx medusa plugin:publish
```

### 2. Install in your Medusa app

In your Medusa application directory:

```bash
# If needed (Medusa < v2.3.1)
npm install --save-dev yalc

# Add the plugin from the local registry
npx medusa plugin:add medusa-plugin-bcms
```

### 3. Register the plugin

In your Medusa app’s `medusa-config.ts`:

```ts
module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "medusa-plugin-bcms",
      options: {},
    },
  ],
})
```

### 4. Develop with live reload

In the **plugin** directory:

```bash
npx medusa plugin:develop
```

In the **Medusa app** directory:

```bash
npm run dev
```

Then call the routes (e.g. `GET http://localhost:9000/store/bcms` or `GET http://localhost:9000/store/bcms/entries`).

## Replacing mock data with BCMS

- Edit `src/mocks/bcms-data.ts` to add or change mock content.
- To use the real BCMS API, replace the mock usage in:
  - `src/api/store/bcms/**/*.ts`
  - `src/api/admin/bcms/route.ts`
  with your BCMS client (e.g. `@bcms/sdk` or custom fetch).

## Build for production / NPM

```bash
npm run build
# Then: npm publish (when ready)
```

## Requirements

- Medusa v2.3.0+
- Node.js 20+
