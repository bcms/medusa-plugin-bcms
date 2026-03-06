import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Layers3 } from "@medusajs/icons"
import BcmsSettingsPage from "../settings/bcms/page"

export const config = defineRouteConfig({
  label: "BCMS",
  icon: Layers3,
})

export default BcmsSettingsPage

