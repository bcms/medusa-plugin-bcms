import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateBcmsLinkStep,
  type UpdateBcmsLinkStepInput,
} from "./steps/update-bcms-link"

export const updateBcmsLinkWorkflow = createWorkflow(
  "update-bcms-link",
  function (input: UpdateBcmsLinkStepInput) {
    const bcmsLink = updateBcmsLinkStep(input)
    return new WorkflowResponse(bcmsLink)
  }
)

export default updateBcmsLinkWorkflow
