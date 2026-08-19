import type { Logger } from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils"
import { Client } from "@thebcms/client"
import BcmsLink from "./models/bcms-link"
import BcmsSetting from "./models/bcms-setting"
import {
  BCMS_SETTING_ID,
  type BcmsConnectionStatus,
  type BcmsModuleOptions,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

class BcmsModuleService extends MedusaService({
  BcmsLink,
  BcmsSetting,
}) {
  protected readonly logger_: Logger
  protected readonly options_: BcmsModuleOptions
  protected readonly client_?: Client

  static validateOptions(options: BcmsModuleOptions) {
    if (
      options.apiKey !== undefined &&
      typeof options.apiKey !== "string"
    ) {
      throw new Error(
        "[@thebcms/medusa-plugin] `apiKey` option must be a string when provided."
      )
    }
  }

  constructor(
    { logger }: InjectedDependencies,
    options: BcmsModuleOptions = {}
  ) {
    // @ts-ignore
    super(...arguments)
    this.logger_ = logger
    this.options_ = options

    if (!this.options_.apiKey) {
      this.logger_.warn(
        "[@thebcms/medusa-plugin] BCMS_API_KEY is not configured. The plugin will load, but BCMS calls will fail until a key is provided in plugin options."
      )
      this.client_ = undefined
      return
    }

    this.client_ = new Client({
      apiKey: this.options_.apiKey,
      cmsOrigin: this.options_.cmsOrigin,
      useMemCache: this.options_.useMemCache ?? true,
      debug: this.options_.debug ?? false,
    })
    this.logger_.info(
      "[@thebcms/medusa-plugin] BCMS client initialized."
    )
  }

  hasApiKey(): boolean {
    return !!this.client_
  }

  protected requireClient(): Client {
    if (!this.client_) {
      throw new Error(
        "[@thebcms/medusa-plugin] BCMS API key is not configured. Set `apiKey` in the plugin options."
      )
    }
    return this.client_
  }

  async testConnection(): Promise<BcmsConnectionStatus> {
    if (!this.client_) {
      return {
        ok: false,
        message: "BCMS API key is not configured.",
      }
    }
    try {
      const templates = await this.client_.template.getAll(true)
      return {
        ok: true,
        templates_count: Array.isArray(templates) ? templates.length : 0,
      }
    } catch (e: any) {
      return {
        ok: false,
        message: e?.message ?? "Failed to reach BCMS.",
      }
    }
  }

  async getBcmsTemplates(skipCache = false) {
    return this.requireClient().template.getAll(skipCache)
  }

  async getBcmsEntries(input: { template: string; skipCache?: boolean }) {
    const { template, skipCache = false } = input
    const entries = await this.requireClient().entry.getAll(
      template,
      skipCache
    )
    return entries as any[]
  }

  async getBcmsEntryById(input: {
    entryId: string
    template: string
    skipCache?: boolean
  }) {
    return this.requireClient().entry.getById(
      input.entryId,
      input.template,
      input.skipCache ?? false
    )
  }

  async getBcmsEntryBySlug(input: {
    slug: string
    template: string
    skipCache?: boolean
  }) {
    return this.requireClient().entry.getBySlug(
      input.slug,
      input.template,
      input.skipCache ?? false
    )
  }

  async getOrCreateBcmsSetting() {
    const [existing] = await this.listBcmsSettings(
      { id: BCMS_SETTING_ID },
      { take: 1 }
    )
    if (existing) {
      return existing
    }
    try {
      const [created] = await this.createBcmsSettings([
        {
          id: BCMS_SETTING_ID,
          enabled_templates: [],
          default_slots: [],
          slot_templates: {},
          last_test_at: null,
          last_test_status: null,
          last_test_message: null,
        },
      ])
      return created
    } catch {
      const [winner] = await this.listBcmsSettings(
        { id: BCMS_SETTING_ID },
        { take: 1 }
      )
      if (winner) {
        return winner
      }
      throw new Error(
        "[@thebcms/medusa-plugin] Failed to create BCMS settings singleton."
      )
    }
  }
}

export default BcmsModuleService
