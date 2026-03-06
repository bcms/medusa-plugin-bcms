import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MOCK_ENTRIES } from "../../../../mocks/bcms-data"

/**
 * GET /store/bcms/entries
 * List BCMS entries (mocked).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contentType = req.query.content_type as string | undefined
  const locale = req.query.locale as string | undefined
  const status = req.query.status as string | undefined

  let entries = [...MOCK_ENTRIES]
  if (contentType) {
    entries = entries.filter((e) => e.contentTypeId === contentType)
  }
  if (locale) {
    entries = entries.filter((e) => e.locale === locale)
  }
  if (status) {
    entries = entries.filter((e) => e.status === status)
  }

  res.json({ entries })
}
