# Medusa BCMS Plugin

This repo contains the **Medusa plugin for BCMS**, which adds BCMS (headless CMS) content to your Medusa store via API routes. It currently uses **mocked data** so you can develop without a BCMS instance.

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
   - Registering it in `medusa-config.ts`
   - Developing with `npx medusa plugin:develop`

3. **Try the APIs**  
   After the plugin is installed and the app is running, for example:
   - `GET http://localhost:9000/store/bcms` – overview
   - `GET http://localhost:9000/store/bcms/entries` – list entries (mocked)
   - `GET http://localhost:9000/store/bcms/pages` – list pages (mocked)

All data is mocked; replace with real BCMS API calls when you integrate.
