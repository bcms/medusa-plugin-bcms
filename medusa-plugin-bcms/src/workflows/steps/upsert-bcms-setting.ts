import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BCMS_MODULE } from "../../modules/bcms"
import type BcmsModuleService from "../../modules/bcms/service"

export type UpsertBcmsSettingStepInput = {
  enabled_templates?: string[]
  default_slots?: string[]
  auto_create_on_product?: boolean
  last_test_at?: Date | null
  last_test_status?: "ok" | "error" | null
  last_test_message?: string | null
}

export const upsertBcmsSettingStep = createStep(
  "upsert-bcms-setting",
  async (input: UpsertBcmsSettingStepInput, { container }) => {
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    const setting = await bcms.getOrCreateBcmsSetting()

    const previous = {
      id: setting.id,
      enabled_templates: setting.enabled_templates,
      default_slots: setting.default_slots,
      auto_create_on_product: setting.auto_create_on_product,
      last_test_at: setting.last_test_at,
      last_test_status: setting.last_test_status,
      last_test_message: setting.last_test_message,
    }

    const updated = await bcms.updateBcmsSettings({
      id: setting.id,
      ...(input.enabled_templates !== undefined
        ? { enabled_templates: input.enabled_templates }
        : {}),
      ...(input.default_slots !== undefined
        ? { default_slots: input.default_slots }
        : {}),
      ...(input.auto_create_on_product !== undefined
        ? { auto_create_on_product: input.auto_create_on_product }
        : {}),
      ...(input.last_test_at !== undefined
        ? { last_test_at: input.last_test_at }
        : {}),
      ...(input.last_test_status !== undefined
        ? { last_test_status: input.last_test_status }
        : {}),
      ...(input.last_test_message !== undefined
        ? { last_test_message: input.last_test_message }
        : {}),
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const bcms = container.resolve<BcmsModuleService>(BCMS_MODULE)
    const lastTestAt = previous.last_test_at
    await bcms.updateBcmsSettings({
      id: previous.id,
      enabled_templates: previous.enabled_templates,
      default_slots: previous.default_slots,
      auto_create_on_product: previous.auto_create_on_product,
      last_test_at:
        lastTestAt instanceof Date
          ? lastTestAt
          : lastTestAt
            ? new Date(lastTestAt as any)
            : null,
      last_test_status: previous.last_test_status,
      last_test_message: previous.last_test_message,
    })
  }
)
