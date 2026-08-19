export const BCMS_SETTING_ID = "bcms_setting_singleton"

export type BcmsModuleOptions = {
  apiKey?: string
  cmsOrigin?: string
  useMemCache?: boolean
  debug?: boolean
}

export type BcmsConnectionStatus = {
  ok: boolean
  message?: string
  templates_count?: number
}

export type BcmsLinkPayload = {
  id: string
  entry_id: string
  template_name: string
  slot: string
  language: string | null
  position: number
  metadata: Record<string, unknown> | null
}

export type BcmsSettingPayload = {
  id: string
  enabled_templates: string[]
  default_slots: string[]
  slot_templates: Record<string, string[]>
  last_test_at: Date | string | null
  last_test_status: "ok" | "error" | null
  last_test_message: string | null
}
