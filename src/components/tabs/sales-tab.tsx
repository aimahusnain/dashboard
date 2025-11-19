'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SalesTab() {
  const { data: sales = [], isLoading } = useSWR('/api/sales', fetcher)

  const todaySales = sales.filter((s: any) => {
    const date = new Date(s.date || Date.now())
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

  const monthSales = sales.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
  const todayOrders = sales.filter((s: any) => {
    const date = new Date(s.date || Date.now())
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).length

  const topProducts = sales
    .reduce((acc: any[], s: any) => {
      const existing = acc.find((p) => p.name === s.product)
      if (existing) {
        existing.sales += 1
        existing.revenue += s.amount || 0
      } else {
        acc.push({ name: s.product || 'Unknown', sales: 1, revenue: s.amount || 0 })
      }
      return acc
    }, [])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} />
              Today's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${todaySales.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{todayOrders} orders</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${monthSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{sales.length} orders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product: any) => (
                  <div key={product.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                    </div>
                    <p className="font-semibold text-foreground">${product.revenue.toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sales yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
