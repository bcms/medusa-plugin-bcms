import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { BCMS_MODULE } from "../../../../modules/bcms"
import type BcmsModuleService from "../../../../modules/bcms/service"
import { updateBcmsSettingWorkflow } from "../../../../workflows/update-bcms-setting"
import { serializeSetting } from "../utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)

  const status = await bcms.testConnection()

  const { result: setting } = await updateBcmsSettingWorkflow(req.scope).run({
    input: {
      last_test_at: new Date(),
      last_test_status: status.ok ? "ok" : "error",
      last_test_message: status.ok
        ? `Connected. Found ${status.templates_count ?? 0} templates.`
        : status.message ?? "Failed to reach BCMS.",
    },
  })

  res.json({
    status,
    has_api_key: bcms.hasApiKey(),
    setting: serializeSetting(setting),
  })
}
