import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BcmsModuleService from "../../../modules/bcms/service"
import { BCMS_MODULE } from "../../../modules/bcms"

/**
 * GET /admin/bcms
 *
 * Pure BCMS-backed endpoint:
 * - When BCMS_API_KEY is not configured, returns 400 with has_api_key: false.
 * - When configured, fetches all templates and all entries per template.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const bcmsModuleService = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)

    if (!bcmsModuleService.hasApiKey()) {
      res.status(400).json({
        bcms: "not-configured",
        has_api_key: false,
        message: "BCMS_API_KEY is not configured in plugin options.",
      })
      return
    }

    const templates = await bcmsModuleService.listTemplates(true)

    const entriesByTemplate: Record<string, unknown[]> = {}
    for (const tpl of templates as any[]) {
      const tplName = tpl?.name as string | undefined
      if (!tplName) {
        continue
      }
      entriesByTemplate[tplName] =
        (await bcmsModuleService.listEntriesForTemplate(tplName, true)) ?? []
    }

    res.json({
      bcms: "configured",
      has_api_key: true,
      templates,
      entries_by_template: entriesByTemplate,
    })
  } catch (e) {
    res.status(500).json({
      bcms: "error",
      has_api_key: false,
      message: "Failed to fetch data from BCMS.",
    })
  }
}
