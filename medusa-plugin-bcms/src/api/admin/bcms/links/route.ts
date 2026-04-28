import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductBcmsLinkWorkflow } from "../../../../workflows/create-product-bcms-link"
import type {
  CreateBcmsLinkSchema,
  ListBcmsLinksSchema,
} from "../validators"
import { serializeLink } from "../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { product_id } = req.validatedQuery as ListBcmsLinksSchema

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "bcms_links.id",
      "bcms_links.entry_id",
      "bcms_links.template_name",
      "bcms_links.slot",
      "bcms_links.language",
      "bcms_links.position",
      "bcms_links.metadata",
    ],
    filters: { id: product_id },
  })

  const product = products[0]
  const links = (product?.bcms_links ?? []) as any[]

  const sorted = [...links].sort((a, b) => {
    const slotCmp = (a.slot ?? "default").localeCompare(b.slot ?? "default")
    if (slotCmp !== 0) {
      return slotCmp
    }
    return (a.position ?? 0) - (b.position ?? 0)
  })

  res.json({
    product_id,
    links: sorted.map(serializeLink),
  })
}

export async function POST(
  req: MedusaRequest<CreateBcmsLinkSchema>,
  res: MedusaResponse
) {
  const { result } = await createProductBcmsLinkWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({ link: serializeLink(result) })
}
