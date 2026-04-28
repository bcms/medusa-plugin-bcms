import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useEffect, useMemo, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Select, Button } from "@medusajs/ui"

const STORAGE_KEY = "bcms:selectedTemplates"

type TemplateName = string

type BcmsEntry = {
  _id?: string
  slug?: string
  [key: string]: any
}

type BcmsAdminResponse = {
  bcms: string
  has_api_key: boolean
  templates?: any[]
  entries_by_template?: Record<string, BcmsEntry[]>
  message?: string
}

type BcmsEntryOption = {
  id: string
  label: string
  templateName: string
}

const loadEnabledTemplates = (): TemplateName[] => {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const BcmsProductWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [enabledTemplates, setEnabledTemplates] = useState<TemplateName[]>([])
  const [entriesByTemplate, setEntriesByTemplate] = useState<Record<string, BcmsEntry[]>>({})
  const [entryId, setEntryId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setEnabledTemplates(loadEnabledTemplates())
  }, [])

  useEffect(() => {
    const fetchBcmsData = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/admin/bcms")
        const data: BcmsAdminResponse = await res.json()

        if (!data.has_api_key) {
          setError(
            data.message || "BCMS_API_KEY is not configured. Set it in the Medusa app environment."
          )
          setEntriesByTemplate({})
          return
        }

        setEntriesByTemplate(data.entries_by_template || {})
      } catch (e: any) {
        setError("Failed to load entries from BCMS.")
        setEntriesByTemplate({})
      } finally {
        setLoading(false)
      }
    }

    fetchBcmsData()
  }, [])

  const aggregatedOptions: BcmsEntryOption[] = useMemo(() => {
    const enabledSet = new Set(enabledTemplates)
    const options: BcmsEntryOption[] = []

    for (const [templateName, entries] of Object.entries(entriesByTemplate)) {
      if (enabledSet.size > 0 && !enabledSet.has(templateName)) {
        continue
      }

      for (const entry of entries) {
        const id = String(entry._id ?? entry.slug ?? JSON.stringify(entry))
        // Try to read title from the first available language meta
        const meta = (entry as any)?.meta
        let title: string | undefined
        if (Array.isArray(meta) && meta.length > 0) {
          const first = meta[0]
          title =
            first?.data?.title ??
            first?.data?.name ??
            first?.data?.slug
        }

        const label = title ?? entry.slug ?? id

        options.push({
          id,
          label: `${templateName}: ${label}`,
          templateName,
        })
      }
    }

    return options
  }, [entriesByTemplate, enabledTemplates])

  const selectedOption = aggregatedOptions.find((opt) => opt.id === entryId)

  const handleSave = async () => {
    if (!selectedOption) {
      return
    }
    try {
      setSaving(true)
      setSaved(false)

      const res = await fetch(`/admin/bcms/products/${data.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId: selectedOption.id,
          templateName: selectedOption.templateName,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || "Failed to save BCMS mapping.")
      }

      setSaved(true)
    } catch (e: any) {
      setError(e.message || "Failed to save BCMS mapping.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">BCMS content</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Link this product to BCMS content by choosing an entry aggregated from all selected templates..
          </Text>
        </div>
      </div>
      <div className="px-6 py-4 space-y-3">
        {loading && (
          <Text size="small" className="text-ui-fg-subtle">
            Loading entries from BCMS...
          </Text>
        )}

        {!loading && error && (
          <Text size="small" className="text-ui-fg-subtle">
            {error}
          </Text>
        )}

        {!loading && !error && aggregatedOptions.length === 0 && (
          <Text size="small" className="text-ui-fg-subtle">
            No BCMS entries found for the selected templates. Go to BCMS settings to select templates.
          </Text>
        )}

        {!loading && !error && aggregatedOptions.length > 0 && (
          <>
            <div className="space-y-1">
              <Text weight="plus">BCMS entry</Text>
              <Select value={entryId} onValueChange={(value) => setEntryId(value)}>
                <Select.Trigger>
                  <Select.Value placeholder="Select a BCMS entry" />
                </Select.Trigger>
                <Select.Content>
                  {aggregatedOptions.map((opt) => (
                    <Select.Item key={opt.id} value={opt.id}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            {selectedOption && (
              <div className="pt-2 space-y-1">
                <Text size="small" className="text-ui-fg-subtle">
                  Selected mapping (saved on product metadata):
                </Text>
                <Text size="small">
                  Template: <span className="font-semibold">{selectedOption.templateName}</span>
                </Text>
                <Text size="small">
                  Entry ID: <span className="font-semibold">{selectedOption.id}</span>
                </Text>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="button"
                size="small"
                variant="secondary"
                disabled={!selectedOption || saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : saved ? "Saved" : "Save mapping"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default BcmsProductWidget

