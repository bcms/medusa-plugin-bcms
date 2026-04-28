import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import {
  CreateBcmsLinkSchema,
  ListBcmsEntriesSchema,
  ListBcmsLinksSchema,
  ListBcmsTemplatesSchema,
  UpdateBcmsLinkSchema,
  UpdateBcmsSettingSchema,
} from "./admin/bcms/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/bcms/templates",
      method: "GET",
      middlewares: [validateAndTransformQuery(ListBcmsTemplatesSchema, {})],
    },
    {
      matcher: "/admin/bcms/entries",
      method: "GET",
      middlewares: [validateAndTransformQuery(ListBcmsEntriesSchema, {})],
    },
    {
      matcher: "/admin/bcms/links",
      method: "GET",
      middlewares: [validateAndTransformQuery(ListBcmsLinksSchema, {})],
    },
    {
      matcher: "/admin/bcms/links",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateBcmsLinkSchema)],
    },
    {
      matcher: "/admin/bcms/links/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateBcmsLinkSchema)],
    },
    {
      matcher: "/admin/bcms/settings",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateBcmsSettingSchema)],
    },
  ],
})
