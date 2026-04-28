import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Layers3 } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../../lib/sdk"
import type {
  BcmsConnectionStatus,
  BcmsSetting,
  BcmsTemplate,
} from "../../../lib/types"

type SettingsResponse = {
  setting: BcmsSetting
  has_api_key: boolean
}

type TemplatesResponse = {
  has_api_key: boolean
  templates?: BcmsTemplate[]
  message?: string
}

type TestConnectionResponse = {
  status: BcmsConnectionStatus
  has_api_key: boolean
  setting: BcmsSetting
}

const BcmsSettingsPage = () => {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ["bcms-settings"],
    queryFn: () =>
      sdk.client.fetch<SettingsResponse>("/admin/bcms/settings"),
  })

  const templatesQuery = useQuery({
    queryKey: ["bcms-templates"],
    queryFn: () =>
      sdk.client.fetch<TemplatesResponse>("/admin/bcms/templates"),
    retry: false,
  })

  const updateSettings = useMutation({
    mutationFn: (payload: Partial<BcmsSetting>) =>
      sdk.client.fetch<SettingsResponse>("/admin/bcms/settings", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bcms-settings"] })
      toast.success("BCMS settings saved.")
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to save BCMS settings.")
    },
  })

  const testConnection = useMutation({
    mutationFn: () =>
      sdk.client.fetch<TestConnectionResponse>(
        "/admin/bcms/test-connection",
        { method: "POST" }
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bcms-settings"] })
      queryClient.invalidateQueries({ queryKey: ["bcms-templates"] })
      if (data.status.ok) {
        toast.success(
          `Connected to BCMS (${data.status.templates_count ?? 0} templates).`
        )
      } else {
        toast.error(data.status.message ?? "Failed to reach BCMS.")
      }
    },
  })

  const setting = settingsQuery.data?.setting
  const hasApiKey = settingsQuery.data?.has_api_key ?? false
  const enabled = setting?.enabled_templates ?? []
  const slots = setting?.default_slots ?? ["default"]

  const [slotInput, setSlotInput] = useState("")

  useEffect(() => {
    setSlotInput("")
  }, [setting?.id])

  const sortedTemplates = useMemo(
    () =>
      (templatesQuery.data?.templates ?? [])
        .slice()
        .sort((a, b) =>
          (a.label ?? a.name).localeCompare(b.label ?? b.name)
        ),
    [templatesQuery.data?.templates]
  )

  const toggleTemplate = (templateName: string) => {
    if (!setting) return
    const next = enabled.includes(templateName)
      ? enabled.filter((t) => t !== templateName)
      : [...enabled, templateName]
    updateSettings.mutate({ enabled_templates: next })
  }

  const addSlot = () => {
    const trimmed = slotInput.trim()
    if (!trimmed || slots.includes(trimmed)) {
      setSlotInput("")
      return
    }
    updateSettings.mutate({ default_slots: [...slots, trimmed] })
    setSlotInput("")
  }

  const removeSlot = (slot: string) => {
    if (slot === "default") {
      toast.info('The "default" slot is required and cannot be removed.')
      return
    }
    updateSettings.mutate({
      default_slots: slots.filter((s) => s !== slot),
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between px-6 py-4">
        <div>
          <Heading level="h2">BCMS</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Configure your BCMS integration. Pick which BCMS templates can be
            attached to Medusa entities and which slots are available on the
            product widget.
          </Text>
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              Connection
            </Text>
            <div className="flex items-center gap-x-2">
              <Badge color={hasApiKey ? "green" : "red"} size="2xsmall">
                {hasApiKey ? "API key configured" : "No API key"}
              </Badge>
              {setting?.last_test_status && (
                <Badge
                  color={
                    setting.last_test_status === "ok" ? "green" : "red"
                  }
                  size="2xsmall"
                >
                  Last test: {setting.last_test_status}
                </Badge>
              )}
            </div>
            {setting?.last_test_message && (
              <Text size="small" className="text-ui-fg-subtle">
                {setting.last_test_message}
              </Text>
            )}
          </div>
          <Button
            type="button"
            size="small"
            variant="secondary"
            isLoading={testConnection.isPending}
            onClick={() => testConnection.mutate()}
            disabled={!hasApiKey}
          >
            Test connection
          </Button>
        </div>

        {!hasApiKey && (
          <Text size="small" className="text-ui-fg-subtle">
            Set <code>BCMS_API_KEY</code> in your Medusa environment and pass
            it through the plugin's <code>apiKey</code> option in{" "}
            <code>medusa-config.ts</code>.
          </Text>
        )}
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-3">
        <Text size="small" weight="plus">
          Enabled templates
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          Templates listed here will be available when picking BCMS entries on
          a product. If none are selected, all templates are available.
        </Text>

        {settingsQuery.isLoading || templatesQuery.isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading BCMS templates&hellip;
          </Text>
        ) : !hasApiKey ? (
          <Text size="small" className="text-ui-fg-subtle">
            Configure the BCMS API key to load templates.
          </Text>
        ) : templatesQuery.isError ? (
          <Text size="small" className="text-ui-fg-subtle">
            Failed to load templates.{" "}
            {(templatesQuery.error as any)?.message ?? ""}
          </Text>
        ) : sortedTemplates.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No templates were found in this BCMS instance.
          </Text>
        ) : (
          <div className="flex flex-col gap-y-2">
            {sortedTemplates.map((tpl) => (
              <label
                key={tpl._id ?? tpl.id ?? tpl.name}
                className="flex items-start gap-x-2 cursor-pointer select-none"
              >
                <Checkbox
                  checked={enabled.includes(tpl.name)}
                  onCheckedChange={() => toggleTemplate(tpl.name)}
                  disabled={updateSettings.isPending}
                />
                <div className="flex flex-col">
                  <Text size="small" weight="plus">
                    {tpl.label ?? tpl.name}
                  </Text>
                  {tpl.name && tpl.label && tpl.label !== tpl.name && (
                    <Text size="small" className="text-ui-fg-subtle">
                      {tpl.name}
                    </Text>
                  )}
                  {tpl.desc && (
                    <Text size="small" className="text-ui-fg-subtle">
                      {tpl.desc}
                    </Text>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-3">
        <Text size="small" weight="plus">
          Slots
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          Slots let you attach multiple BCMS entries per product, each in a
          named role (e.g. <code>rich_description</code>,{" "}
          <code>recommended_blogs</code>). The <code>default</code> slot is
          always available.
        </Text>

        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <Badge
              key={slot}
              size="small"
              color={slot === "default" ? "grey" : "blue"}
              className="flex items-center gap-x-1"
            >
              <span>{slot}</span>
              {slot !== "default" && (
                <button
                  type="button"
                  onClick={() => removeSlot(slot)}
                  className="ml-1 text-ui-fg-subtle hover:text-ui-fg-base"
                  aria-label={`Remove slot ${slot}`}
                >
                  &times;
                </button>
              )}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-x-2">
          <Input
            placeholder="e.g. recommended_blogs"
            value={slotInput}
            onChange={(e) => setSlotInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addSlot()
              }
            }}
            className="max-w-xs"
          />
          <Button
            type="button"
            size="small"
            variant="secondary"
            onClick={addSlot}
            disabled={updateSettings.isPending || slotInput.trim().length === 0}
          >
            Add slot
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "BCMS",
  icon: Layers3,
})

export default BcmsSettingsPage
