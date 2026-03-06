import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MOCK_PAGES } from "../../../../mocks/bcms-data"

/**
 * GET /store/bcms/pages
 * List BCMS pages (mocked).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const locale = req.query.locale as string | undefined
  const status = req.query.status as string | undefined

  let pages = [...MOCK_PAGES]
  if (locale) {
    pages = pages.filter((p) => p.locale === locale)
  }
  if (status) {
    pages = pages.filter((p) => p.status === status)
  }

  res.json({ pages })
}
