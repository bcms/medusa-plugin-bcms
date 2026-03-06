import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MOCK_ENTRIES } from "../../../../../mocks/bcms-data"

/**
 * GET /store/bcms/entries/:id
 * Get a single BCMS entry by id (mocked).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const entry = MOCK_ENTRIES.find((e) => e.id === id)
  if (!entry) {
    res.status(404).json({ message: "Entry not found" })
    return
  }
  res.json({ entry })
}
