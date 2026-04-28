import type { Logger } from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils"
import { Client } from "@thebcms/client"
import BcmsLink from "./models/bcms-link"
import BcmsSetting from "./models/bcms-setting"
import type {
  BcmsConnectionStatus,
  BcmsModuleOptions,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

const SETTINGS_DEFAULT_SLOTS = ["default"]

class BcmsModuleService extends MedusaService({
  BcmsLink,
  BcmsSetting,
}) {
  protected readonly logger_: Logger
  protected readonly options_: BcmsModuleOptions
  protected readonly client_?: Client

  static validateOptions(options: BcmsModuleOptions) {
    // apiKey is optional so the plugin can boot without it (for first-run UX).
    // Validation of the key happens lazily via testConnection().
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
    // @ts-ignore - MedusaService base class accepts a container/options pair at runtime.
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
      useMemCache: this.options_.useMemCache ?? false,
      debug: this.options_.debug ?? false,
    })
    this.logger_.info(
      "[@thebcms/medusa-plugin] BCMS client initialized."
    )
  }

  /* -------------------------------------------------------------------------- */
  /*                            Plugin configuration                            */
  /* -------------------------------------------------------------------------- */

  hasApiKey(): boolean {
    return !!this.client_
  }

  getOptions(): BcmsModuleOptions {
    return this.options_
  }

  /* -------------------------------------------------------------------------- */
  /*                                 BCMS calls                                 */
  /* -------------------------------------------------------------------------- */

  protected requireClient(): Client {
    if (!this.client_) {
      throw new Error(
        "[@thebcms/medusa-plugin] BCMS API key is not configured. Set `apiKey` in the plugin options."
      )
    }
    return this.client_
  }

  /**
   * Verify connectivity to the BCMS instance. Returns a structured result
   * instead of throwing so callers can show user-friendly errors.
   */
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

  // NOTE: do not name BCMS-API methods `list*` — `MedusaService` reserves
  // `list${Pluralize<EntityName>}` for its auto-generated CRUD methods, and
  // adding a colliding method triggers TS2411 on the service class.
  async getBcmsTemplates(skipCache = false) {
    return this.requireClient().template.getAll(skipCache)
  }

  /**
   * Fetch entries for a given template, with optional substring search and
   * pagination.
   *
   * BCMS' client returns all entries for the template; we filter and paginate
   * server-side here so the admin UI can do search/pagination in one round-trip.
   */
  async getBcmsEntries(input: {
    template: string
    q?: string
    limit?: number
    offset?: number
    skipCache?: boolean
  }) {
    const { template, q, limit = 20, offset = 0, skipCache = false } = input
    const all = await this.requireClient().entry.getAll(template, skipCache)

    const filtered = q
      ? (all as any[]).filter((entry) => entryMatchesQuery(entry, q))
      : (all as any[])

    return {
      entries: filtered.slice(offset, offset + limit),
      count: filtered.length,
      limit,
      offset,
    }
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

  /* -------------------------------------------------------------------------- */
  /*                              Settings helper                               */
  /* -------------------------------------------------------------------------- */

  /**
   * Always returns a valid settings row, creating one with sensible defaults
   * on first call.
   */
  async getOrCreateBcmsSetting() {
    const [existing] = await this.listBcmsSettings(
      {},
      { take: 1, order: { created_at: "ASC" } }
    )
    if (existing) {
      return existing
    }
    const [created] = await this.createBcmsSettings([
      {
        enabled_templates: [],
        default_slots: SETTINGS_DEFAULT_SLOTS,
        auto_create_on_product: false,
        last_test_at: null,
        last_test_status: null,
        last_test_message: null,
      },
    ])
    return created
  }
}

const TITLE_KEYS = ["title", "name", "label", "slug"]

function entryMatchesQuery(entry: any, q: string): boolean {
  const needle = q.toLowerCase()

  if (typeof entry?.slug === "string" && entry.slug.toLowerCase().includes(needle)) {
    return true
  }
  const meta = entry?.meta
  if (Array.isArray(meta)) {
    for (const m of meta) {
      const data = m?.data ?? {}
      for (const key of TITLE_KEYS) {
        const value = data?.[key]
        if (typeof value === "string" && value.toLowerCase().includes(needle)) {
          return true
        }
      }
    }
  }
  return false
}

export default BcmsModuleService
