'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/use-language'
import Sidebar from '@/components/sidebar'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#14b8a6']

export default function DashboardAnalysisPage() {
  const { language } = useLanguage()
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedModel, setSelectedModel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { data: tracker = [], isLoading: trackerLoading } = useSWR('/api/tracker', fetcher)
  const { data: validations = [] } = useSWR('/api/validations', fetcher)

  const labels = {
    en: {
      title: 'Dashboard Analysis',
      subtitle: 'Comprehensive business analytics and insights',
      filters: 'Filters',
      year: 'Year',
      brand: 'Brand',
      model: 'Model',
      status: 'Status',
      all: 'All',
      stats: 'Stats',
      totalPrixAchat: 'Total Prix Achat',
      totalRecon: 'Total Recon',
      totalEsthetique: 'Total Esthétique',
      totalTransport: 'Total Transport',
      coutantTotal: 'Coutant Total',
      acceCredit: 'Acces Crédit',
      prixAffiche: 'Prix Affiche',
      profitPotentiel: 'Profit Potentiel',
      coutantTotalByModel: 'Coutant Total by Model',
      profitPotentielByModel: 'Profit Potentiel by Model',
      kilometrageByModel: 'Kilométrage by Model',
      statusDistribution: 'Status Distribution',
    },
    fr: {
      title: 'Analyse Tableau de bord',
      subtitle: 'Analyses commerciales et informations complètes',
      filters: 'Filtres',
      year: 'Année',
      brand: 'Marque',
      model: 'Modèle',
      status: 'Statut',
      all: 'Tous',
      stats: 'Statistiques',
      totalPrixAchat: 'Total Prix Achat',
      totalRecon: 'Total Recon',
      totalEsthetique: 'Total Esthétique',
      totalTransport: 'Total Transport',
      coutantTotal: 'Coutant Total',
      acceCredit: 'Acces Crédit',
      prixAffiche: 'Prix Affiche',
      profitPotentiel: 'Profit Potentiel',
      coutantTotalByModel: 'Coutant Total par Modèle',
      profitPotentielByModel: 'Profit Potentiel par Modèle',
      kilometrageByModel: 'Kilométrage par Modèle',
      statusDistribution: 'Distribution des Statuts',
    }
  }

  const t = labels[language as keyof typeof labels]

  const years = Array.from(new Set(tracker.map((item: any) => item.year?.toString()))).filter(Boolean).sort((a: any, b: any) => b - a)
  const brands = Array.from(new Set(tracker.map((item: any) => item.make))).filter(Boolean).sort()
  const models = Array.from(new Set(
    selectedBrand === 'all' 
      ? tracker.map((item: any) => item.model)
      : tracker.filter((item: any) => item.make === selectedBrand).map((item: any) => item.model)
  )).filter(Boolean).sort()

  const filteredData = tracker.filter((item: any) => {
    if (selectedYear !== 'all' && item.year?.toString() !== selectedYear) return false
    if (selectedBrand !== 'all' && item.make !== selectedBrand) return false
    if (selectedModel !== 'all' && item.model !== selectedModel) return false
    if (selectedStatus === 'sold' && !item.sellStatus) return false
    if (selectedStatus === 'unsold' && item.sellStatus) return false
    return true
  })

  const metrics = {
    totalPrixAchat: filteredData.reduce((sum: number, item: any) => sum + (item.purchasePrice || 0), 0),
    totalRecon: filteredData.reduce((sum: number, item: any) => sum + (item.reconciliation || 0), 0),
    totalEsthetique: filteredData.reduce((sum: number, item: any) => sum + (item.adjustment || 0), 0),
    totalTransport: filteredData.reduce((sum: number, item: any) => sum + (item.transport || 0), 0),
    coutantTotal: filteredData.reduce((sum: number, item: any) => sum + (item.costTotal || 0), 0),
    acceCredit: filteredData.reduce((sum: number, item: any) => sum + (item.accessCredit || 0), 0),
    prixAffiche: filteredData.reduce((sum: number, item: any) => sum + (item.displayedPrice || 0), 0),
    profitPotentiel: filteredData.reduce((sum: number, item: any) => sum + (item.potentialProfit || 0), 0),
  }

  const dataByModel: Record<string, any> = {}
  filteredData.forEach((item: any) => {
    const model = item.model || 'Unknown'
    if (!dataByModel[model]) {
      dataByModel[model] = {
        model,
        coutantTotal: 0,
        profitPotentiel: 0,
        mileage: 0,
        count: 0,
      }
    }
    dataByModel[model].coutantTotal += item.costTotal || 0
    dataByModel[model].profitPotentiel += item.potentialProfit || 0
    dataByModel[model].mileage += item.mileage || 0
    dataByModel[model].count += 1
  })

  const chartData = Object.values(dataByModel)
  const soldCount = filteredData.filter((item: any) => item.sellStatus).length
  const unsoldCount = filteredData.length - soldCount
  const statusData = [
    { name: 'Sold', value: soldCount },
    { name: 'Unsold', value: unsoldCount }
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-card/50 backdrop-blur">
        <div className="px-8 py-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{t.title}</h2>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
      </header>

      <div className="p-8 space-y-8">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t.filters}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.year}</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {years.map((year: any) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.brand}</label>
                <Select value={selectedBrand} onValueChange={(val) => {
                  setSelectedBrand(val)
                  setSelectedModel('all')
                }}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {brands.map((brand: any) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.model}</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {models.map((model: any) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.status}</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="unsold">Unsold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-4">{t.stats}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t.totalPrixAchat, value: metrics.totalPrixAchat, gradient: 'from-blue-600 to-blue-400' },
              { label: t.totalRecon, value: metrics.totalRecon, gradient: 'from-purple-600 to-purple-400' },
              { label: t.totalEsthetique, value: metrics.totalEsthetique, gradient: 'from-pink-600 to-pink-400' },
              { label: t.totalTransport, value: metrics.totalTransport, gradient: 'from-amber-600 to-amber-400' },
              { label: t.coutantTotal, value: metrics.coutantTotal, gradient: 'from-emerald-600 to-emerald-400' },
              { label: t.acceCredit, value: metrics.acceCredit, gradient: 'from-cyan-600 to-cyan-400' },
              { label: t.prixAffiche, value: metrics.prixAffiche, gradient: 'from-rose-600 to-rose-400' },
              { label: t.profitPotentiel, value: metrics.profitPotentiel, gradient: 'from-teal-600 to-teal-400' },
            ].map((stat) => (
              <Card key={stat.label} className={`bg-gradient-to-br ${stat.gradient} border-0`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${stat.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {!trackerLoading && chartData.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>{t.coutantTotalByModel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="coutantTotal" fill="url(#colorGradient1)" />
                      <defs>
                        <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" />
                          <stop offset="95%" stopColor="#1e40af" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>{t.statusDistribution}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>{t.profitPotentielByModel}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="profitPotentiel" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>{t.kilometrageByModel}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mileage" fill="url(#colorGradient2)" />
                    <defs>
                      <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" />
                        <stop offset="95%" stopColor="#065f46" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
