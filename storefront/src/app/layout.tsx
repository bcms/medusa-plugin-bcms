import type { ReactNode } from "react"
import "./globals.css"

export const metadata = {
  title: "BCMS × Medusa storefront",
  description: "Minimal Next.js storefront reading BCMS slots from Medusa.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
