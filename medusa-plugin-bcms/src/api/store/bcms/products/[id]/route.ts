import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { BCMS_MODULE } from "../../../../../modules/bcms"
import type BcmsModuleService from "../../../../../modules/bcms/service"

/**
 * GET /store/bcms/products/:id
 *
 * Returns the Medusa product (with its BCMS link rows) plus the resolved
 * BCMS entry payloads grouped by `slot`.
 *
 * Requires the storefront's publishable API key (handled automatically by the
 * Medusa JS SDK).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "subtitle",
      "description",
      "thumbnail",
      "status",
      "bcms_links.id",
      "bcms_links.entry_id",
      "bcms_links.template_name",
      "bcms_links.slot",
      "bcms_links.language",
      "bcms_links.position",
    ],
    filters: { id },
  })

  const product = products[0]

  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found.")
  }

  const links = ((product as any).bcms_links ?? []) as any[]

  const enrichedLinks = await Promise.all(
    links.map(async (link) => {
      let entry: any = null
      let error: string | null = null
      if (bcms.hasApiKey()) {
        try {
          entry = await bcms.getBcmsEntryById({
            entryId: link.entry_id,
            template: link.template_name,
          })
        } catch (e: any) {
          error = e?.message ?? "Failed to fetch BCMS entry."
        }
      } else {
        error = "BCMS API key is not configured on the server."
      }
      return {
        id: link.id,
        slot: link.slot ?? "default",
        position: link.position ?? 0,
        language: link.language ?? null,
        entry_id: link.entry_id,
        template_name: link.template_name,
        entry,
        error,
      }
    })
  )

  enrichedLinks.sort((a, b) => {
    const slotCmp = a.slot.localeCompare(b.slot)
    if (slotCmp !== 0) return slotCmp
    return a.position - b.position
  })

  const grouped: Record<string, typeof enrichedLinks> = {}
  for (const link of enrichedLinks) {
    grouped[link.slot] = grouped[link.slot] ?? []
    grouped[link.slot].push(link)
  }

  res.json({
    product: {
      id: (product as any).id,
      title: (product as any).title,
      handle: (product as any).handle,
      subtitle: (product as any).subtitle ?? null,
      description: (product as any).description ?? null,
      thumbnail: (product as any).thumbnail ?? null,
      status: (product as any).status,
    },
    bcms: {
      links: enrichedLinks,
      by_slot: grouped,
    },
  })
}
