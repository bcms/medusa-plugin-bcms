# Medusa Plugin BCMS

BCMS integration for Medusa – headless CMS content in your store. This plugin uses the official `@thebcms/client` to fetch real BCMS templates and entries and expose them in the Medusa Admin.

## Features

- **Admin BCMS settings** – Choose which BCMS templates are available for product enrichment.
- **Product widget** – On the product details page, select a BCMS entry (aggregated across the enabled templates) and store the mapping on the product’s metadata.
- **BCMS-backed API** – `/admin/bcms` returns live templates and entries using `BCMS_API_KEY`.

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
      options: {
        apiKey: process.env.BCMS_API_KEY,
      },
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

Once the app is running and `BCMS_API_KEY` is set, you can open:

- `http://localhost:9000/app/bcms` – configure enabled BCMS templates.
- Any product detail page – use the “BCMS content” widget to link a BCMS entry.

## Build for production / NPM

```bash
npm run build
# Then: npm publish (when ready)
```

## Requirements

- Medusa v2.3.0+
- Node.js 20+
