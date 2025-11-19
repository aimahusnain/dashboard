'use client'

import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, ShoppingCart, Zap, Package } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { language } = useLanguage()
  const { data: inventory = [] } = useSWR('/api/inventory', fetcher)
  const { data: sales = [] } = useSWR('/api/sales', fetcher)
  const { data: validations = [] } = useSWR('/api/validations', fetcher)

  const labels = {
    en: {
      dashboard: 'Dashboard',
      overview: 'Overview of your business metrics',
      totalVehicles: 'Total Vehicles',
      totalSales: 'Total Sales',
      totalBrands: 'Unique Brands',
      totalRevenue: 'Total Revenue',
      recentActivity: 'Recent Activity',
      lastUpdated: 'Last updated',
      noActivity: 'No recent activity',
      vehicles: 'vehicles',
      sales: 'sales recorded',
      brands: 'brands',
    },
    fr: {
      dashboard: 'Tableau de bord',
      overview: 'Aperçu de vos métriques commerciales',
      totalVehicles: 'Véhicules totaux',
      totalSales: 'Ventes totales',
      totalBrands: 'Marques uniques',
      totalRevenue: 'Revenu total',
      recentActivity: 'Activité récente',
      lastUpdated: 'Dernière mise à jour',
      noActivity: 'Aucune activité récente',
      vehicles: 'véhicules',
      sales: 'ventes enregistrées',
      brands: 'marques',
    }
  }

  const t = labels[language as keyof typeof labels]

  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.salePrice || 0), 0)
  const uniqueBrands = new Set(validations.map((v: any) => v.brand)).size

  const stats = [
    { label: t.totalVehicles, value: inventory.length, icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: t.totalSales, value: sales.length, icon: ShoppingCart, color: 'from-green-500 to-green-600' },
    { label: t.totalBrands, value: uniqueBrands, icon: Zap, color: 'from-purple-500 to-purple-600' },
    { label: t.totalRevenue, value: `$${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-8 py-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.dashboard}</h2>
          <p className="text-muted-foreground mt-2">{t.overview}</p>
        </div>
      </header>

      <div className="p-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-card/80 backdrop-blur border-border/50 hover:border-border transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>{t.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noActivity}</p>
            ) : (
              <div className="space-y-4">
                {sales.slice(-5).reverse().map((sale: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 hover:bg-muted/50 p-2 rounded transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{sale.brand} {sale.model}</p>
                      <p className="text-xs text-muted-foreground">Salesman: {sale.salesman}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">${parseFloat(sale.salePrice || 0).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{sale.saleDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
