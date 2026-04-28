/**
 * Public TS types for the BCMS plugin. Re-exported from
 * `@thebcms/medusa-plugin/modules/bcms` so storefronts and host apps
 * can `import type {...}` without depending on internal paths.
 */

export type BcmsModuleOptions = {
  /**
   * BCMS API key (full token, including instance/project info).
   * Required to talk to BCMS.
   */
  apiKey?: string
  /**
   * Origin of the BCMS instance to talk to. Defaults to https://app.thebcms.com.
   */
  cmsOrigin?: string
  /**
   * Whether to enable in-memory caching inside the BCMS client.
   */
  useMemCache?: boolean
  /**
   * Enable verbose BCMS client logging.
   */
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
  auto_create_on_product: boolean
  last_test_at: Date | string | null
  last_test_status: "ok" | "error" | null
  last_test_message: string | null
}
