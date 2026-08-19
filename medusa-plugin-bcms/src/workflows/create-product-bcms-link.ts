import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { BCMS_MODULE } from "../modules/bcms"
import { createBcmsLinkStep } from "./steps/create-bcms-link"

export type CreateProductBcmsLinkInput = {
  product_id: string
  entry_id: string
  template_name: string
  slot: string
  language?: string | null
  position?: number
  metadata?: Record<string, unknown> | null
}

export const createProductBcmsLinkWorkflow = createWorkflow(
  "create-product-bcms-link",
  function (input: CreateProductBcmsLinkInput) {
    const bcmsLink = createBcmsLinkStep({
      entry_id: input.entry_id,
      template_name: input.template_name,
      slot: input.slot,
      language: input.language,
      position: input.position,
      metadata: input.metadata,
    })

    const linkData = transform(
      { bcmsLink, input },
      ({ bcmsLink, input }) => [
        {
          [Modules.PRODUCT]: { product_id: input.product_id },
          [BCMS_MODULE]: { bcms_link_id: bcmsLink.id },
        },
      ]
    )

    createRemoteLinkStep(linkData)

    return new WorkflowResponse(bcmsLink)
  }
)

export default createProductBcmsLinkWorkflow
