import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BCMS_MODULE } from "../../../../../modules/bcms"
import type BcmsModuleService from "../../../../../modules/bcms/service"

/**
 * GET /store/bcms/pages/:slug?template=<template_name>
 *
 * Storefront-facing read of a single BCMS entry by slug. Useful for
 * standalone CMS pages (e.g. /about, /faq, blog post slugs).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params as { slug: string }
  const template = req.query.template as string | undefined

  if (!template) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "`template` query parameter is required."
    )
  }

  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)
  if (!bcms.hasApiKey()) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "BCMS API key is not configured on the server."
    )
  }

  try {
    const entry = await bcms.getBcmsEntryBySlug({ slug, template })
    res.json({ entry })
  } catch (e: any) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      e?.message ?? "Failed to fetch BCMS entry."
    )
  }
}
