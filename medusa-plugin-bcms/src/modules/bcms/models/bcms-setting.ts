import { model } from "@medusajs/framework/utils"

const BcmsSetting = model.define("bcms_setting", {
  id: model.id().primaryKey(),
  enabled_templates: model.array(),
  default_slots: model.array(),
  slot_templates: model.json().default({}),
  last_test_at: model.dateTime().nullable(),
  last_test_status: model.text().nullable(),
  last_test_message: model.text().nullable(),
})

export default BcmsSetting
