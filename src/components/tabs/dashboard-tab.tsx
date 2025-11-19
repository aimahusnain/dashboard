import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, ShoppingCart, Package } from 'lucide-react'

export default function DashboardTab() {
  const stats = [
    { label: 'Total Sales', value: '$45,231.89', icon: ShoppingCart, trend: '+20.1%' },
    { label: 'Active Users', value: '2,345', icon: Users, trend: '+15.3%' },
    { label: 'Revenue', value: '$12,500', icon: TrendingUp, trend: '+8.2%' },
    { label: 'Inventory', value: '1,234 items', icon: Package, trend: '-2.4%' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground pt-1">{stat.trend} from last month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Activity {i + 1}</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <span className="text-xs font-semibold text-primary">View</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
