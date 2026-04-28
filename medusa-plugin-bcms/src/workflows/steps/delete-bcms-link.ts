import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BCMS_MODULE } from "../../modules/bcms"
import type BcmsModuleService from "../../modules/bcms/service"

export type DeleteBcmsLinkStepInput = {
  id: string
}

export const deleteBcmsLinkStep = createStep(
  "delete-bcms-link",
  async (input: DeleteBcmsLinkStepInput, { container }) => {
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    const existing = await bcms.retrieveBcmsLink(input.id)
    await bcms.deleteBcmsLinks(input.id)
    return new StepResponse({ id: input.id }, existing)
  },
  async (existing, { container }) => {
    if (!existing) {
      return
    }
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    await bcms.createBcmsLinks([
      {
        id: existing.id,
        entry_id: existing.entry_id,
        template_name: existing.template_name,
        slot: existing.slot,
        language: existing.language,
        position: existing.position,
        metadata: existing.metadata as Record<string, unknown> | null,
      },
    ])
  }
)
