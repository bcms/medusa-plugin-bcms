import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BCMS_MODULE } from "../../../../modules/bcms"
import type BcmsModuleService from "../../../../modules/bcms/service"
import type { ListBcmsTemplatesSchema } from "../validators"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)
  const { skip_cache } = req.validatedQuery as ListBcmsTemplatesSchema

  if (!bcms.hasApiKey()) {
    res.status(400).json({
      has_api_key: false,
      message:
        "BCMS API key is not configured. Set `apiKey` in the @thebcms/medusa-plugin options.",
    })
    return
  }

  try {
    const templates = await bcms.getBcmsTemplates(skip_cache ?? false)
    res.json({
      has_api_key: true,
      templates,
    })
  } catch (e: any) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      e?.message ?? "Failed to fetch BCMS templates."
    )
  }
}
