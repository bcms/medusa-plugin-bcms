import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BCMS_MODULE } from "../../../../modules/bcms"
import type BcmsModuleService from "../../../../modules/bcms/service"
import type { ListBcmsEntriesSchema } from "../validators"
import { pickEntryTitle } from "../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)
  const { template, skip_cache } =
    req.validatedQuery as ListBcmsEntriesSchema

  if (!bcms.hasApiKey()) {
    res.status(400).json({
      has_api_key: false,
      message:
        "BCMS API key is not configured. Set `apiKey` in the @thebcms/medusa-plugin options.",
    })
    return
  }

  try {
    const entries = await bcms.getBcmsEntries({
      template,
      skipCache: skip_cache,
    })

    res.json({
      has_api_key: true,
      template,
      entries: entries.map((entry: any) => ({
        ...entry,
        _resolved_title: pickEntryTitle(entry),
      })),
    })
  } catch (e: any) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      e?.message ?? "Failed to fetch BCMS entries."
    )
  }
}
