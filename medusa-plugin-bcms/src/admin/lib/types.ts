export type BcmsTemplate = {
  _id?: string
  id?: string
  name: string
  label?: string
  desc?: string
  [key: string]: any
}

export type BcmsEntrySummary = {
  _id?: string
  id?: string
  slug?: string
  meta?: Array<{
    lng?: string
    data?: Record<string, any>
  }>
  _resolved_title?: string
  [key: string]: any
}

export type BcmsLink = {
  id: string
  entry_id: string
  template_name: string
  slot: string
  language: string | null
  position: number
  metadata: Record<string, unknown> | null
}

export type BcmsSetting = {
  id: string
  enabled_templates: string[]
  default_slots: string[]
  auto_create_on_product: boolean
  last_test_at: string | Date | null
  last_test_status: "ok" | "error" | null
  last_test_message: string | null
}

export type BcmsConnectionStatus = {
  ok: boolean
  message?: string
  templates_count?: number
}
