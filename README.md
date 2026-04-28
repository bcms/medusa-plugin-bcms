# Medusa BCMS Plugin

This repo contains the **Medusa plugin for BCMS**, which adds BCMS (headless CMS) content to your Medusa store via admin extensions and server-side routes. It now uses the official `@thebcms/client` to talk to a real BCMS instance.

## Quick start

1. **Plugin lives in** `medusa-plugin-bcms/`. Go there to develop or build:

   ```bash
   cd medusa-plugin-bcms
   npm install
   npm run build
   ```

2. **Use in a Medusa app**
   See [medusa-plugin-bcms/README.md](./medusa-plugin-bcms/README.md) for:
   - Publishing the plugin locally (`npx medusa plugin:publish`)
   - Adding it to your app (`npx medusa plugin:add medusa-plugin-bcms`)
   - Registering it in `medusa-config.ts` with `BCMS_API_KEY`
   - Developing with `npx medusa plugin:develop`

3. **Try the admin UI**
   After the plugin is installed and the app is running:
   - `http://localhost:9000/app/bcms` – configure which BCMS templates are available.
   - Product detail page → “BCMS content” widget – link a BCMS entry to a product.

cd medusa-plugin-bcms
npm run build
npx medusa plugin:publish
cd ../medusa-app
npx medusa plugin:add medusa-plugin-bcms
