import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type SaveBcmsMappingBody = {
  entryId: string
  templateName?: string
}

/**
 * POST /admin/bcms/products/:product_id
 * Persist BCMS mapping on a product's metadata.
 */
export async function POST(
  req: MedusaRequest<SaveBcmsMappingBody>,
  res: MedusaResponse<{ product: any } | { message: string }>
) {
  const { product_id } = req.params as { product_id: string }
  const { entryId, templateName } = req.body as SaveBcmsMappingBody

  if (!entryId) {
    res.status(400).json({ message: "entryId is required" })
    return
  }

  const productModuleService = req.scope.resolve<any>("product")

  // Retrieve existing product to merge metadata
  const [product] = await productModuleService.listProducts({ id: product_id }, { take: 1 })

  if (!product) {
    res.status(404).json({ message: "Product not found" })
    return
  }

  const nextMetadata = {
    ...(product.metadata || {}),
    bcms_entry: {
      id: entryId,
      template: templateName,
    },
  }

  const updated = await productModuleService.updateProducts({
    id: product_id,
    metadata: nextMetadata,
  })

  res.json({ product: updated })
}

