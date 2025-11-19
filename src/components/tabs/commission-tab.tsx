'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CommissionTab() {
  const { data: commissions = [], isLoading } = useSWR('/api/commissions', fetcher)

  const totalCommission = commissions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  const pending = commissions.filter((c: any) => c.status === 'pending').length
  const paid = commissions.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + (c.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${totalCommission.toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last period</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{pending}</p>
            <p className="text-xs text-muted-foreground mt-1">Processing...</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">${paid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">2 payments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {commissions.length > 0 ? (
                commissions.map((commission: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <DollarSign size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Commission #{i + 1}</p>
                        <p className="text-xs text-muted-foreground">{commission.type || 'Sale completed'}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">+${(commission.amount || 0).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No commissions yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
