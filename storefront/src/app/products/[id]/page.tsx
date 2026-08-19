import {
  localeContent,
  localeMeta,
  previewPayload,
  richTextHtml,
} from "@/lib/bcms"
import { sdk } from "@/lib/medusa"
import type { BcmsLink, ProductWithBcms } from "@/lib/types"

export const dynamic = "force-dynamic"

function Nodes({ nodes }: { nodes: any[] }) {
  return (
    <div className="prose">
      {nodes.map((node, i) => {
        if (typeof node?.value === "string") {
          return (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: node.value }}
            />
          )
        }
        if (node?.type === "widget") {
          const value = node.value ?? {}
          return (
            <div key={i} className="callout">
              <strong>{value.heading ?? node.widgetName}</strong>
              {value.body ? <div>{value.body}</div> : null}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

function SlotSection({ slot, links }: { slot: string; links: BcmsLink[] }) {
  if (slot === "rich_description") {
    const entry = links[0]?.entry
    const meta = localeMeta(entry)
    return (
      <section className="slot">
        <p className="slot-name">bcms.slots.{slot}</p>
        <h2>{meta.title ?? "Rich description"}</h2>
        {meta.tagline ? <p className="lede">{meta.tagline}</p> : null}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: richTextHtml(meta.about) }}
        />
        <Nodes nodes={localeContent(entry)} />
      </section>
    )
  }

  if (slot === "recommended_blogs") {
    return (
      <section className="slot">
        <p className="slot-name">bcms.slots.{slot}</p>
        <h2>Recommended</h2>
        <div className="blogs">
          {links.map((link) => {
            const meta = localeMeta(link.entry)
            const cover = meta.cover
            return (
              <article key={link.id} className="blog">
                {cover?.url ? (
                  <img src={cover.url} alt={cover.alt_text || meta.title} />
                ) : (
                  <div />
                )}
                <div>
                  <h3>{meta.title}</h3>
                  <p>{meta.subtitle}</p>
                  <small>
                    {link.template_name} · {link.entry_id}
                  </small>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <section className="slot">
      <p className="slot-name">bcms.slots.{slot}</p>
      <h2>{slot}</h2>
      {links.map((link) => {
        const meta = localeMeta(link.entry)
        return (
          <div key={link.id}>
            <h3>{meta.title ?? link.entry_id}</h3>
            {meta.subtitle ? <p>{meta.subtitle}</p> : null}
            <small>
              {link.template_name}
              {link.error ? ` · ${link.error}` : ""}
            </small>
          </div>
        )
      })}
    </section>
  )
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await sdk.client.fetch<ProductWithBcms>(
    `/store/bcms/products/${id}`
  )
  const slots = Object.keys(data.bcms.slots)
  const preferred = ["rich_description", "recommended_blogs"]
  const ordered = [
    ...preferred.filter((slot) => slots.includes(slot)),
    ...slots.filter((slot) => !preferred.includes(slot)),
  ]
  const preview = previewPayload(data)

  return (
    <main className="wrap">
      <a className="back" href="/">
        ← All products
      </a>
      <p className="kicker">Medusa product</p>
      <h1>{data.product.title}</h1>
      <p className="lede">
        {data.product.description || data.product.handle} · {data.product.id}
      </p>

      {ordered.map((slot) => (
        <SlotSection
          key={slot}
          slot={slot}
          links={data.bcms.slots[slot] ?? []}
        />
      ))}

      <section className="inspector">
        <p className="kicker">Store API</p>
        <h2>What Medusa returns</h2>
        <p className="note">
          <code>GET /store/bcms/products/{id}</code> — product plus resolved
          BCMS entries grouped by <code>bcms.slots</code>. Nested entry
          pointers are collapsed in this preview; the live payload expands
          them fully.
        </p>
        <pre>{JSON.stringify(preview, null, 2)}</pre>
      </section>
    </main>
  )
}
