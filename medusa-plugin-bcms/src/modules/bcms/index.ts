import { Module } from "@medusajs/framework/utils"
import BcmsModuleService from "./service"

export const BCMS_MODULE = "bcms"

export default Module(BCMS_MODULE, {
  service: BcmsModuleService,
})

export { BcmsModuleService }
export type {
  BcmsModuleOptions,
  BcmsConnectionStatus,
  BcmsLinkPayload,
  BcmsSettingPayload,
} from "./types"
