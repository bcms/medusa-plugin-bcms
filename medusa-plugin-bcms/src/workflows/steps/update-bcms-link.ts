import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BCMS_MODULE } from "../../modules/bcms"
import type BcmsModuleService from "../../modules/bcms/service"

export type UpdateBcmsLinkStepInput = {
  id: string
  entry_id?: string
  template_name?: string
  slot?: string
  language?: string | null
  position?: number
  metadata?: Record<string, unknown> | null
}

export const updateBcmsLinkStep = createStep(
  "update-bcms-link",
  async (input: UpdateBcmsLinkStepInput, { container }) => {
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    const previous = await bcms.retrieveBcmsLink(input.id)

    const updated = await bcms.updateBcmsLinks({
      id: input.id,
      ...(input.entry_id !== undefined ? { entry_id: input.entry_id } : {}),
      ...(input.template_name !== undefined
        ? { template_name: input.template_name }
        : {}),
      ...(input.slot !== undefined ? { slot: input.slot } : {}),
      ...(input.language !== undefined ? { language: input.language } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    await bcms.updateBcmsLinks({
      id: previous.id,
      entry_id: previous.entry_id,
      template_name: previous.template_name,
      slot: previous.slot,
      language: previous.language,
      position: previous.position,
      metadata: previous.metadata as Record<string, unknown> | null,
    })
  }
)
