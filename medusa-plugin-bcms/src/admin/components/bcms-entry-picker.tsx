import { Button, Input, Select, Text } from "@medusajs/ui"
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
  count: number
  limit: number
  offset: number
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

const DEFAULT_LIMIT = 20

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
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
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [selected, setSelected] = useState<string>(initialEntryId ?? "")

  useEffect(() => {
    if (template === "" && allowed.length > 0) {
      setTemplate(allowed[0].name)
    }
  }, [allowed, template])

  const entriesQuery = useQuery({
    queryKey: ["bcms-entries", template, debouncedSearch],
    queryFn: () =>
      sdk.client.fetch<EntriesResponse>("/admin/bcms/entries", {
        query: {
          template,
          q: debouncedSearch || undefined,
          limit: DEFAULT_LIMIT,
        },
      }),
    enabled: !!template,
  })

  const selectedEntry = useMemo(() => {
    return (
      entriesQuery.data?.entries.find((e) => entryId(e) === selected) ?? null
    )
  }, [entriesQuery.data?.entries, selected])

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
        <Select value={template} onValueChange={setTemplate}>
          <Select.Trigger>
            <Select.Value placeholder="Select a BCMS template" />
          </Select.Trigger>
          <Select.Content>
            {allowed.length === 0 ? (
              <Select.Item value="__no_templates__" disabled>
                No templates available
              </Select.Item>
            ) : (
              allowed.map((tpl) => (
                <Select.Item
                  key={tpl._id ?? tpl.id ?? tpl.name}
                  value={tpl.name}
                >
                  {tpl.label ?? tpl.name}
                </Select.Item>
              ))
            )}
          </Select.Content>
        </Select>
      </div>

      <div className="flex flex-col gap-y-1">
        <Text size="small" weight="plus">
          Search
        </Text>
        <Input
          placeholder="Search entries by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        ) : (entriesQuery.data?.entries.length ?? 0) === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No entries match your search.
          </Text>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <Select.Trigger>
              <Select.Value placeholder="Select an entry" />
            </Select.Trigger>
            <Select.Content>
              {(entriesQuery.data?.entries ?? []).map((entry) => {
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
        {entriesQuery.data &&
          entriesQuery.data.count > entriesQuery.data.entries.length && (
            <Text size="small" className="text-ui-fg-subtle">
              Showing {entriesQuery.data.entries.length} of{" "}
              {entriesQuery.data.count} matches. Refine your search to narrow
              results.
            </Text>
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
