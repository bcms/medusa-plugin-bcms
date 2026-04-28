import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type {
  AdminProduct,
  DetailWidgetProps,
} from "@medusajs/framework/types"
import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  IconButton,
  Text,
  toast,
} from "@medusajs/ui"
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo, useState } from "react"
import BcmsEntryPicker from "../components/bcms-entry-picker"
import { sdk } from "../lib/sdk"
import type {
  BcmsEntrySummary,
  BcmsLink,
  BcmsSetting,
  BcmsTemplate,
} from "../lib/types"
import { entryTitle } from "../lib/utils"

type LinksResponse = { product_id: string; links: BcmsLink[] }
type TemplatesResponse = { has_api_key: boolean; templates?: BcmsTemplate[] }
type SettingsResponse = { setting: BcmsSetting; has_api_key: boolean }
type CreateLinkResponse = { link: BcmsLink }
type EntriesResponse = {
  has_api_key: boolean
  template: string
  entries: BcmsEntrySummary[]
  count: number
}

const linksKey = (productId: string) => ["bcms-links", productId] as const
const settingsKey = ["bcms-settings"] as const
const templatesKey = ["bcms-templates"] as const

const BcmsProductWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const productId = data.id

  const [composeSlot, setComposeSlot] = useState<string | null>(null)

  const linksQuery = useQuery({
    queryKey: linksKey(productId),
    queryFn: () =>
      sdk.client.fetch<LinksResponse>("/admin/bcms/links", {
        query: { product_id: productId },
      }),
  })

  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: () => sdk.client.fetch<SettingsResponse>("/admin/bcms/settings"),
  })

  const templatesQuery = useQuery({
    queryKey: templatesKey,
    queryFn: () =>
      sdk.client.fetch<TemplatesResponse>("/admin/bcms/templates"),
    retry: false,
  })

  const setting = settingsQuery.data?.setting
  const hasApiKey =
    settingsQuery.data?.has_api_key ?? templatesQuery.data?.has_api_key ?? false
  const enabledTemplates = setting?.enabled_templates ?? []
  const slots = setting?.default_slots ?? ["default"]
  const templates = templatesQuery.data?.templates ?? []

  const links = linksQuery.data?.links ?? []

  const linksBySlot = useMemo(() => {
    const groups: Record<string, BcmsLink[]> = {}
    for (const slot of slots) {
      groups[slot] = []
    }
    for (const link of links) {
      const slot = link.slot ?? "default"
      groups[slot] = groups[slot] ?? []
      groups[slot].push(link)
    }
    for (const slot of Object.keys(groups)) {
      groups[slot] = groups[slot].sort((a, b) => a.position - b.position)
    }
    return groups
  }, [links, slots])

  const linkedTitleQueries = useQueries({
    queries: links.map((link) => ({
      queryKey: [
        "bcms-entry-title",
        link.template_name,
        link.entry_id,
      ] as const,
      queryFn: async () => {
        const res = await sdk.client.fetch<EntriesResponse>(
          "/admin/bcms/entries",
          { query: { template: link.template_name, limit: 100 } }
        )
        const match = res.entries.find(
          (e) => String(e._id ?? e.id) === link.entry_id
        )
        return match ? entryTitle(match) : null
      },
      enabled: hasApiKey,
      staleTime: 60_000,
    })),
  })

  const linkTitles = useMemo(() => {
    const map: Record<string, string | null> = {}
    links.forEach((link, idx) => {
      map[link.id] = (linkedTitleQueries[idx]?.data ?? null) as string | null
    })
    return map
  }, [links, linkedTitleQueries])

  const createLink = useMutation({
    mutationFn: (input: {
      entry_id: string
      template_name: string
      slot: string
    }) =>
      sdk.client.fetch<CreateLinkResponse>("/admin/bcms/links", {
        method: "POST",
        body: { product_id: productId, ...input },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linksKey(productId) })
      toast.success("BCMS entry linked.")
      setComposeSlot(null)
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to link BCMS entry.")
    },
  })

  const deleteLink = useMutation({
    mutationFn: (linkId: string) =>
      sdk.client.fetch(`/admin/bcms/links/${linkId}`, {
        method: "DELETE",
        query: { product_id: productId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linksKey(productId) })
      toast.success("BCMS entry unlinked.")
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to unlink BCMS entry.")
    },
  })

  const renderEmpty = () => {
    if (!hasApiKey) {
      return (
        <Text size="small" className="text-ui-fg-subtle">
          Set <code>BCMS_API_KEY</code> in the plugin options to start linking
          BCMS entries to this product.
        </Text>
      )
    }
    if (linksQuery.isLoading || settingsQuery.isLoading) {
      return (
        <Text size="small" className="text-ui-fg-subtle">
          Loading BCMS links&hellip;
        </Text>
      )
    }
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">BCMS content</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Attach BCMS entries to this product, grouped by slot. Slots are
            configured under Settings &rsaquo; BCMS.
          </Text>
        </div>
        {!hasApiKey && (
          <Badge color="red" size="2xsmall">
            BCMS not configured
          </Badge>
        )}
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-5">
        {renderEmpty()}

        {hasApiKey && !linksQuery.isLoading && (
          <>
            {slots.map((slot) => {
              const slotLinks = linksBySlot[slot] ?? []
              const isComposing = composeSlot === slot
              return (
                <div key={slot} className="flex flex-col gap-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2">
                      <Text size="small" weight="plus">
                        {slot}
                      </Text>
                      <Badge size="2xsmall" color="grey">
                        {slotLinks.length}
                      </Badge>
                    </div>
                    {!isComposing && (
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => setComposeSlot(slot)}
                      >
                        Add entry
                      </Button>
                    )}
                  </div>

                  {slotLinks.length === 0 && !isComposing && (
                    <Text size="small" className="text-ui-fg-subtle">
                      No entries linked in this slot yet.
                    </Text>
                  )}

                  {slotLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-x-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <Text size="small" weight="plus">
                          {linkTitles[link.id] ?? link.entry_id}
                        </Text>
                        <Text size="small" className="text-ui-fg-subtle">
                          {link.template_name}
                          {link.language ? ` · ${link.language}` : ""}
                        </Text>
                      </div>
                      <IconButton
                        type="button"
                        size="small"
                        variant="transparent"
                        onClick={() => deleteLink.mutate(link.id)}
                        disabled={deleteLink.isPending}
                        aria-label="Remove BCMS link"
                      >
                        <Trash />
                      </IconButton>
                    </div>
                  ))}

                  {isComposing && templates.length > 0 && (
                    <div className="rounded-md border border-ui-border-base p-3">
                      <BcmsEntryPicker
                        templates={templates}
                        enabledTemplates={enabledTemplates}
                        submitLabel="Link entry"
                        disabled={createLink.isPending}
                        onCancel={() => setComposeSlot(null)}
                        onSelect={({ entry_id, template_name }) =>
                          createLink.mutate({
                            entry_id,
                            template_name,
                            slot,
                          })
                        }
                      />
                    </div>
                  )}

                  {isComposing && templates.length === 0 && (
                    <Text size="small" className="text-ui-fg-subtle">
                      No BCMS templates are available. Configure templates in
                      BCMS first.
                    </Text>
                  )}
                </div>
              )
            })}

            <div className="flex items-center gap-x-2 pt-2">
              <Text size="small" className="text-ui-fg-subtle">
                Need another section? Add a slot in Settings &rsaquo; BCMS.
              </Text>
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
