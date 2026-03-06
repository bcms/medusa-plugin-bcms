import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MOCK_CONTENT_TYPES,
  MOCK_ENTRIES,
  MOCK_PAGES,
} from "../../../mocks/bcms-data"

/**
 * GET /admin/bcms
 * BCMS overview for admin (mocked).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    bcms: "connected",
    mock: true,
    content_types: MOCK_CONTENT_TYPES,
    entries_count: MOCK_ENTRIES.length,
    pages_count: MOCK_PAGES.length,
  })
}
