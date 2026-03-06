import type { Logger } from "@medusajs/framework/types"
import { Client } from "@thebcms/client"

export type BcmsModuleOptions = {
  apiKey?: string
  cmsOrigin?: string
  useMemCache?: boolean
  debug?: boolean
}

type InjectedDependencies = {
  logger: Logger
}

export default class BcmsModuleService {
  private readonly logger: Logger
  private readonly options: BcmsModuleOptions
  private readonly client?: Client

  static validateOptions(options: BcmsModuleOptions) {
    // Allow missing apiKey for mocked mode.
    // If you want to enforce real BCMS connectivity, throw here when apiKey is missing.
    return
  }

  constructor({ logger }: InjectedDependencies, options: BcmsModuleOptions) {
    this.logger = logger
    this.options = options

    if (!this.options.apiKey) {
      this.logger.warn(
        "[BCMS] apiKey is not set. Plugin will run in mocked mode (no real BCMS calls)."
      )
      this.client = undefined
    } else {
      this.logger.info("[BCMS] apiKey configured. Initializing BCMS client.")
      this.client = new Client({
        apiKey: this.options.apiKey,
        cmsOrigin: this.options.cmsOrigin,
        useMemCache: this.options.useMemCache ?? false,
        debug: this.options.debug ?? false,
      })
    }
  }

  getOptions() {
    return this.options
  }

  hasApiKey() {
    return !!this.client
  }

  /**
   * Fetch all BCMS templates (live) using the client.
   * Throws if apiKey/client is not configured.
   */
  async listTemplates(skipCache = true) {
    if (!this.client) {
      throw new Error("[BCMS] apiKey is not configured; cannot fetch templates.")
    }

    return this.client.template.getAll(skipCache)
  }

  /**
   * Fetch all entries for a given template name.
   * Throws if apiKey/client is not configured.
   */
  async listEntriesForTemplate(templateName: string, skipCache = true) {
    if (!this.client) {
      throw new Error("[BCMS] apiKey is not configured; cannot fetch entries.")
    }

    return this.client.entry.getAll(templateName, skipCache)
  }
}

