import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MOCK_PAGES } from "../../../../../mocks/bcms-data"

/**
 * GET /store/bcms/pages/:slug
 * Get a single BCMS page by slug (mocked).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const page = MOCK_PAGES.find((p) => p.slug === slug)
  if (!page) {
    res.status(404).json({ message: "Page not found" })
    return
  }
  res.json({ page })
}
