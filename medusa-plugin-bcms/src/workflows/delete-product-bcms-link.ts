import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { BCMS_MODULE } from "../modules/bcms"
import { deleteBcmsLinkStep } from "./steps/delete-bcms-link"

export type DeleteProductBcmsLinkInput = {
  product_id: string
  bcms_link_id: string
}

export const deleteProductBcmsLinkWorkflow = createWorkflow(
  "delete-product-bcms-link",
  function (input: DeleteProductBcmsLinkInput) {
    const linkData = transform({ input }, ({ input }) => [
      {
        [Modules.PRODUCT]: { product_id: input.product_id },
        [BCMS_MODULE]: { bcms_link_id: input.bcms_link_id },
      },
    ])

    dismissRemoteLinkStep(linkData)
    const result = deleteBcmsLinkStep({ id: input.bcms_link_id })

    return new WorkflowResponse(result)
  }
)

export default deleteProductBcmsLinkWorkflow
