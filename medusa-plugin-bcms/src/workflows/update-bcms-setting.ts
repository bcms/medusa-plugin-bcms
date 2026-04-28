import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertBcmsSettingStep,
  type UpsertBcmsSettingStepInput,
} from "./steps/upsert-bcms-setting"

export const updateBcmsSettingWorkflow = createWorkflow(
  "update-bcms-setting",
  function (input: UpsertBcmsSettingStepInput) {
    const setting = upsertBcmsSettingStep(input)
    return new WorkflowResponse(setting)
  }
)

export default updateBcmsSettingWorkflow
