import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Checkbox, Button } from "@medusajs/ui"
import { Layers3 } from "@medusajs/icons"

const STORAGE_KEY = "bcms:selectedTemplates"

type TemplateName = string

type BcmsTemplate = {
  id?: string
  name: string
  label?: string
  desc?: string
  [key: string]: any
}

type BcmsAdminResponse = {
  bcms: string
  has_api_key: boolean
  templates?: BcmsTemplate[]
  message?: string
}

const loadInitialSelection = (): TemplateName[] => {
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

const BcmsSettingsPage = () => {
  const [selected, setSelected] = useState<TemplateName[]>([])
  const [templates, setTemplates] = useState<BcmsTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    setSelected(loadInitialSelection())
  }, [])

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/admin/bcms")
        const data: BcmsAdminResponse = await res.json()

        setHasApiKey(data.has_api_key)

        if (!data.has_api_key) {
          setError(
            data.message || "BCMS_API_KEY is not configured. Set it in the Medusa app environment."
          )
          setTemplates([])
          return
        }

        const tpls = data.templates || []
        setTemplates(tpls)
      } catch (e: any) {
        setError("Failed to load templates from BCMS.")
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const toggle = (name: TemplateName) => {
    setSelected((prev) => {
      const exists = prev.includes(name)
      const next = exists ? prev.filter((t) => t !== name) : [...prev, name]
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
      return next
    })
  }

  const clear = () => {
    setSelected([])
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">BCMS settings</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Select which BCMS templates should be available when enriching Medusa products. lol
          </Text>
        </div>
      </div>
      <div className="px-6 py-4 space-y-3">
        {loading && (
          <Text size="small" className="text-ui-fg-subtle">
            Loading templates from BCMS...
          </Text>
        )}

        {!loading && error && (
          <Text size="small" className="text-ui-fg-subtle">
            {error}
          </Text>
        )}

        {!loading && !error && templates.length === 0 && hasApiKey && (
          <Text size="small" className="text-ui-fg-subtle">
            No templates found in BCMS.
          </Text>
        )}

        {!loading &&
          !error &&
          templates.map((tpl) => (
            <label
              key={tpl.id ?? tpl.name}
              className="flex items-center gap-x-2 cursor-pointer select-none"
            >
              <Checkbox
                checked={selected.includes(tpl.name)}
                onCheckedChange={() => toggle(tpl.name)}
              />
              <div>
                <Text weight="plus">{tpl.label || tpl.name}</Text>
                {tpl.desc && (
                  <Text size="small" className="text-ui-fg-subtle">
                    {tpl.desc}
                  </Text>
                )}
              </div>
            </label>
          ))}

        {!loading && !error && templates.length > 0 && (
          <div className="pt-2 flex gap-x-2">
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={clear}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "BCMS",
  icon: Layers3,
})

export default BcmsSettingsPage

