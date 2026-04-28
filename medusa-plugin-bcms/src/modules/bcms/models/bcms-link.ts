import { model } from "@medusajs/framework/utils"

const BcmsLink = model.define("bcms_link", {
  id: model.id().primaryKey(),
  entry_id: model.text(),
  template_name: model.text(),
  slot: model.text().default("default"),
  language: model.text().nullable(),
  position: model.number().default(0),
  metadata: model.json().nullable(),
})

export default BcmsLink
