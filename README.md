# BCMS × Medusa

Monorepo for the official BCMS plugin for Medusa v2.

```
.
├── medusa-plugin-bcms/   # The plugin source — published to npm as @thebcms/medusa-plugin
├── medusa-app/           # Local Medusa host app used to test the plugin
└── other-medusa-interations/  # Reference Medusa-x-CMS tutorials (Sanity, Contentful, Payload)
```

## Plugin

The plugin lives in [`medusa-plugin-bcms/`](./medusa-plugin-bcms). See [its README](./medusa-plugin-bcms/README.md) for full setup, options, and the admin/store API surface.

## Quick local dev loop

```bash
# 1) Build and publish the plugin to the local yalc registry
cd medusa-plugin-bcms
npm install
npx medusa plugin:publish

# 2) Install it in the host app
cd ../medusa-app
npx medusa plugin:add @thebcms/medusa-plugin
echo "BCMS_API_KEY=your-bcms-api-key" >> .env

# 3) Apply migrations (creates bcms_link, bcms_setting, and the product↔bcms_link link table)
npx medusa db:migrate

# 4) Run the host app
npm run dev

# 5) In a separate terminal, watch plugin changes
cd ../medusa-plugin-bcms
npx medusa plugin:develop
```

Then open:

- `http://localhost:9000/app/settings/bcms` — configure templates, slots, run a connection test.
- `http://localhost:9000/app/products` → any product → **BCMS content** widget — link entries to slots.
- `http://localhost:9000/store/bcms/products/<product_id>` — storefront-facing JSON with BCMS entries resolved.
