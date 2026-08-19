import { sdk } from "@/lib/medusa"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { products } = await sdk.store.product.list({ limit: 20 })

  return (
    <main className="wrap">
      <p className="kicker">Medusa store + BCMS slots</p>
      <h1>Shop</h1>
      <p className="lede">
        Ultra-minimal Next.js storefront. Open a product to see the BCMS
        entries Medusa attaches via named slots.
      </p>
      <div className="product-list">
        {products.map((product) => (
          <a
            key={product.id}
            className="product-card"
            href={`/products/${product.id}`}
          >
            <span>{product.title}</span>
            <small>{product.id}</small>
          </a>
        ))}
      </div>
    </main>
  )
}
