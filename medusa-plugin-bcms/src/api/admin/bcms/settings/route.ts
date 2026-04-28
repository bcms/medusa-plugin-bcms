import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { BCMS_MODULE } from "../../../../modules/bcms"
import type BcmsModuleService from "../../../../modules/bcms/service"
import { updateBcmsSettingWorkflow } from "../../../../workflows/update-bcms-setting"
import type { UpdateBcmsSettingSchema } from "../validators"
import { serializeSetting } from "../utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)
  const setting = await bcms.getOrCreateBcmsSetting()
  res.json({
    setting: serializeSetting(setting),
    has_api_key: bcms.hasApiKey(),
  })
}

export async function POST(
  req: MedusaRequest<UpdateBcmsSettingSchema>,
  res: MedusaResponse
) {
  const bcms = req.scope.resolve<BcmsModuleService>(BCMS_MODULE)

  const { result } = await updateBcmsSettingWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({
    setting: serializeSetting(result),
    has_api_key: bcms.hasApiKey(),
  })
}
