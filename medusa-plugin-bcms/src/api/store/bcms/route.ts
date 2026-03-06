import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MOCK_CONTENT_TYPES,
  MOCK_ENTRIES,
  MOCK_PAGES,
} from "../../../mocks/bcms-data"

/**
 * GET /store/bcms
 * Returns BCMS plugin overview (content types count, entries count, pages count).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    bcms: "connected",
    mock: true,
    content_types: MOCK_CONTENT_TYPES.length,
    entries: MOCK_ENTRIES.length,
    pages: MOCK_PAGES.length,
  })
}
