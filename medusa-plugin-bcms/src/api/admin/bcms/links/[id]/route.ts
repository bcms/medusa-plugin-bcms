import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { updateBcmsLinkWorkflow } from "../../../../../workflows/update-bcms-link"
import { deleteProductBcmsLinkWorkflow } from "../../../../../workflows/delete-product-bcms-link"
import type { UpdateBcmsLinkSchema } from "../../validators"
import { serializeLink } from "../../utils"

export async function POST(
  req: MedusaRequest<UpdateBcmsLinkSchema>,
  res: MedusaResponse
) {
  const { id } = req.params as { id: string }

  const { result } = await updateBcmsLinkWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })

  res.json({ link: serializeLink(result) })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const product_id = (req.query.product_id ?? req.query.productId) as
    | string
    | undefined

  if (!product_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "`product_id` query parameter is required when deleting a BCMS link."
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "bcms_links.id"],
    filters: { id: product_id },
  })

  const product = products[0]
  const ownsLink = ((product as any)?.bcms_links ?? []).some(
    (link: { id?: string }) => link?.id === id
  )

  if (!product || !ownsLink) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "BCMS link not found for this product."
    )
  }

  await deleteProductBcmsLinkWorkflow(req.scope).run({
    input: { product_id, bcms_link_id: id },
  })

  res.json({ id, deleted: true })
}
