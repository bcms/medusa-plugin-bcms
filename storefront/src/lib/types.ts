export type BcmsLink = {
  id: string
  slot: string
  position: number
  language: string | null
  entry_id: string
  template_name: string
  entry: BcmsEntry | null
  error: string | null
}

export type BcmsEntry = {
  _id: string
  templateName?: string
  templateId?: string
  meta?: Record<string, Record<string, any>>
  content?: Record<string, any>
  [key: string]: unknown
}

export type ProductWithBcms = {
  product: {
    id: string
    title: string
    handle: string
    subtitle: string | null
    description: string | null
    thumbnail: string | null
    status: string
  }
  bcms: {
    slots: Record<string, BcmsLink[]>
  }
}
