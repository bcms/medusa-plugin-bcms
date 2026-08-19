import { Button, Select, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/sdk"
import type {
  BcmsEntrySummary,
  BcmsTemplate,
} from "../lib/types"
import { entryId, entryTitle } from "../lib/utils"

type EntriesResponse = {
  has_api_key: boolean
  template: string
  entries: BcmsEntrySummary[]
}

type Props = {
  templates: BcmsTemplate[]
  enabledTemplates: string[]
  initialEntryId?: string | null
  initialTemplate?: string | null
  onSelect: (selection: {
    entry_id: string
    template_name: string
    entry: BcmsEntrySummary | null
  }) => void
  onCancel?: () => void
  submitLabel?: string
  disabled?: boolean
}

export const BcmsEntryPicker = ({
  templates,
  enabledTemplates,
  initialEntryId,
  initialTemplate,
  onSelect,
  onCancel,
  submitLabel = "Add entry",
  disabled,
}: Props) => {
  const allowed = useMemo(() => {
    if (enabledTemplates.length === 0) {
      return templates
    }
    const allow = new Set(enabledTemplates)
    return templates.filter((t) => allow.has(t.name))
  }, [templates, enabledTemplates])

  const [template, setTemplate] = useState<string>(
    initialTemplate ?? allowed[0]?.name ?? ""
  )
  const [selected, setSelected] = useState<string>(initialEntryId ?? "")

  useEffect(() => {
    const names = new Set(allowed.map((t) => t.name))
    if (template === "" && allowed.length > 0) {
      setTemplate(allowed[0].name)
      return
    }
    if (template && allowed.length > 0 && !names.has(template)) {
      setTemplate(allowed[0].name)
      setSelected("")
    }
  }, [allowed, template])

  const entriesQuery = useQuery({
    queryKey: ["bcms-entries", template],
    queryFn: () =>
      sdk.client.fetch<EntriesResponse>("/admin/bcms/entries", {
        query: { template },
      }),
    enabled: !!template,
  })

  const sortedEntries = useMemo(() => {
    const list = entriesQuery.data?.entries ?? []
    return list
      .slice()
      .sort((a, b) =>
        entryTitle(a).localeCompare(entryTitle(b), undefined, {
          sensitivity: "base",
        })
      )
  }, [entriesQuery.data?.entries])

  const selectedEntry = useMemo(() => {
    return sortedEntries.find((e) => entryId(e) === selected) ?? null
  }, [sortedEntries, selected])

  const handleSubmit = () => {
    if (!selected || !template) return
    onSelect({
      entry_id: selected,
      template_name: template,
      entry: selectedEntry,
    })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-1">
        <Text size="small" weight="plus">
          Template
        </Text>
        {allowed.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No templates assigned to this slot. Check Settings &rsaquo; BCMS.
          </Text>
        ) : allowed.length === 1 ? (
          <Text size="small" className="text-ui-fg-subtle">
            {allowed[0].label ?? allowed[0].name}
          </Text>
        ) : (
          <Select
            value={template}
            onValueChange={(value) => {
              setTemplate(value)
              setSelected("")
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select a BCMS template" />
            </Select.Trigger>
            <Select.Content>
              {allowed.map((tpl) => (
                <Select.Item
                  key={tpl._id ?? tpl.id ?? tpl.name}
                  value={tpl.name}
                >
                  {tpl.label ?? tpl.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-y-1">
        <Text size="small" weight="plus">
          Entry
        </Text>
        {entriesQuery.isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading entries&hellip;
          </Text>
        ) : entriesQuery.isError ? (
          <Text size="small" className="text-ui-fg-subtle">
            {(entriesQuery.error as any)?.message ?? "Failed to load entries."}
          </Text>
        ) : sortedEntries.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No entries found in this template.
          </Text>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <Select.Trigger>
              <Select.Value placeholder="Select an entry" />
            </Select.Trigger>
            <Select.Content>
              {sortedEntries.map((entry) => {
                const id = entryId(entry)
                return (
                  <Select.Item key={id} value={id}>
                    {entryTitle(entry)}
                  </Select.Item>
                )
              })}
            </Select.Content>
          </Select>
        )}
      </div>

      <div className="flex items-center justify-end gap-x-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            size="small"
            variant="secondary"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          size="small"
          onClick={handleSubmit}
          disabled={disabled || !selected || !template}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export default BcmsEntryPicker
