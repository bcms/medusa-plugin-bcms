import { MedusaError } from "@medusajs/framework/utils"
import type BcmsModuleService from "../../../modules/bcms/service"
import { resolveSlotSettings } from "../../../modules/bcms/settings-utils"

export async function assertStoreTemplateAllowed(
  bcms: BcmsModuleService,
  template: string
) {
  const setting = await bcms.getOrCreateBcmsSetting()
  const { enabled_templates } = resolveSlotSettings(setting)

  if (
    enabled_templates.length > 0 &&
    !enabled_templates.includes(template)
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "BCMS entry not found."
    )
  }
}
