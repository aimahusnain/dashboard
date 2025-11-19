'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function InventoryTab() {
  const { data: inventory = [], isLoading } = useSWR('/api/inventory', fetcher)

  const totalItems = inventory.reduce((sum: number, item: any) => sum + (item.stock || 0), 0)
  const lowStock = inventory.filter((item: any) => item.stock > 0 && item.stock < 50).length
  const outOfStock = inventory.filter((item: any) => item.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalItems.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all warehouses</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{lowStock}</p>
            <p className="text-xs text-orange-600 mt-1">Needs reordering</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{outOfStock}</p>
            <p className="text-xs text-red-600 mt-1">Urgent</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {inventory.length > 0 ? (
                inventory.map((item: any) => {
                  let status = 'In Stock'
                  if (item.stock === 0) status = 'Out of Stock'
                  else if (item.stock < 50) status = 'Low Stock'

                  return (
                    <div key={item._id || item.sku} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.sku || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-foreground">{item.stock}</p>
                        <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                          status === 'In Stock'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : status === 'Low Stock'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {status === 'In Stock' && <CheckCircle size={14} />}
                          {status !== 'In Stock' && <AlertTriangle size={14} />}
                          {status}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">No inventory items yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
