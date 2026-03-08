import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ever Loops - Carpet Billing & Inventory',
  description: 'Professional billing and inventory management for Ever Loops carpet showroom, Qatar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
