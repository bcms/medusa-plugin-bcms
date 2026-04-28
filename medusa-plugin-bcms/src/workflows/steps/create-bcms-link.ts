import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BCMS_MODULE } from "../../modules/bcms"
import type BcmsModuleService from "../../modules/bcms/service"

export type CreateBcmsLinkStepInput = {
  entry_id: string
  template_name: string
  slot?: string
  language?: string | null
  position?: number
  metadata?: Record<string, unknown> | null
}

export const createBcmsLinkStep = createStep(
  "create-bcms-link",
  async (input: CreateBcmsLinkStepInput, { container }) => {
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    const [created] = await bcms.createBcmsLinks([
      {
        entry_id: input.entry_id,
        template_name: input.template_name,
        slot: input.slot ?? "default",
        language: input.language ?? null,
        position: input.position ?? 0,
        metadata: input.metadata ?? null,
      },
    ])
    return new StepResponse(created, created.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    await bcms.deleteBcmsLinks(id)
  }
)
