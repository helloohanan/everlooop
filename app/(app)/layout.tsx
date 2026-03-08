import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/ThemeProvider'
import Sidebar from '@/components/Sidebar'
import { redirect } from 'next/navigation'

async function getLowStockCount() {
  try {
    // Get all products and count those where stock <= their own lowStock threshold
    const products = await prisma.product.findMany({
      select: { stock: true, lowStock: true },
    })
    return products.filter(p => p.stock <= p.lowStock).length
  } catch {
    return 0
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const lowStockCount = await getLowStockCount()

  return (
    <ThemeProvider>
      <div className="app-layout">
        <Sidebar user={{ name: session.name, role: session.role }} lowStockCount={lowStockCount} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
