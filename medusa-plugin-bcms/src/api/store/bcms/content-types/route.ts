import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MOCK_CONTENT_TYPES } from "../../../../mocks/bcms-data"

/**
 * GET /store/bcms/content-types
 * List BCMS content types (mocked).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ content_types: MOCK_CONTENT_TYPES })
}
