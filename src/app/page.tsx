"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/hooks/use-language"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e", "#14b8a6"]

export default function DashboardAnalysisPage() {
  const { language } = useLanguage()
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedModel, setSelectedModel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedColor, setSelectedColor] = useState("all")

  const { data: tracker = [], isLoading: trackerLoading } = useSWR("/api/tracker", fetcher)

  const labels = {
    en: {
      title: "Dashboard Analysis",
      subtitle: "Comprehensive business analytics and insights",
      filters: "Filters",
      year: "Year",
      brand: "Brand",
      model: "Model",
      status: "Status",
      category: "Category",
      color: "Color",
      all: "All",
      stats: "Stats",
      totalPrixAchat: "Total Prix Achat",
      totalRecon: "Total Recon",
      totalEsthetique: "Total Esthétique",
      totalTransport: "Total Transport",
      coutantTotal: "Coutant Total",
      acceCredit: "Acces Crédit",
      prixAffiche: "Prix Affiche",
      profitPotentiel: "Profit Potentiel",
      vehiclesByColor: "Vehicles by Colour",
      mileageDistribution: "Mileage Distribution",
      reconEstheticTransport: "Recon / Esthétique / Transport Spend by Vehicle",
      coutantTotalByModel: "Coutant Total by Model",
      profitPotentielByModel: "Profit Potentiel by Model",
      kilometrageByModel: "Kilométrage by Model",
      sumTotals: "Sum of Coutant Total & Profit Potentiel",
      purchaseCostVsPrice: "Purchase Cost vs Listed Price",
      profitMarginByModel: "Profit % Margin by Model",
      totalCostBreakdown: "Total Cost Breakdown",
      reserveStatusSummary: "Reserve Status Summary",
    },
    fr: {
      title: "Analyse Tableau de bord",
      subtitle: "Analyses commerciales et informations complètes",
      filters: "Filtres",
      year: "Année",
      brand: "Marque",
      model: "Modèle",
      status: "Statut",
      category: "Catégorie",
      color: "Couleur",
      all: "Tous",
      stats: "Statistiques",
      totalPrixAchat: "Total Prix Achat",
      totalRecon: "Total Recon",
      totalEsthetique: "Total Esthétique",
      totalTransport: "Total Transport",
      coutantTotal: "Coutant Total",
      acceCredit: "Acces Crédit",
      prixAffiche: "Prix Affiche",
      profitPotentiel: "Profit Potentiel",
      vehiclesByColor: "Véhicules par Couleur",
      mileageDistribution: "Distribution du Kilométrage",
      reconEstheticTransport: "Dépenses Recon / Esthétique / Transport par Véhicule",
      coutantTotalByModel: "Coutant Total par Modèle",
      profitPotentielByModel: "Profit Potentiel par Modèle",
      kilometrageByModel: "Kilométrage par Modèle",
      sumTotals: "Somme Coutant Total & Profit Potentiel",
      purchaseCostVsPrice: "Coût d'Achat vs Prix Affiché",
      profitMarginByModel: "Marge Bénéficiaire % par Modèle",
      totalCostBreakdown: "Ventilation du Coût Total",
      reserveStatusSummary: "Résumé du Statut de Réserve",
    },
  }

  const t = labels[language as keyof typeof labels]

  const years = Array.from(new Set(tracker.map((item: any) => item.year?.toString())))
    .filter(Boolean)
    .sort((a: any, b: any) => b - a)
  const brands = Array.from(new Set(tracker.map((item: any) => item.make)))
    .filter(Boolean)
    .sort()
  const models = Array.from(
    new Set(
      selectedBrand === "all"
        ? tracker.map((item: any) => item.model)
        : tracker.filter((item: any) => item.make === selectedBrand).map((item: any) => item.model),
    ),
  )
    .filter(Boolean)
    .sort()
  const categories = Array.from(new Set(tracker.map((item: any) => item.category)))
    .filter(Boolean)
    .sort()
  const colors = Array.from(new Set(tracker.map((item: any) => item.color)))
    .filter(Boolean)
    .sort()

  const filteredData = tracker.filter((item: any) => {
    if (selectedYear !== "all" && item.year?.toString() !== selectedYear) return false
    if (selectedBrand !== "all" && item.make !== selectedBrand) return false
    if (selectedModel !== "all" && item.model !== selectedModel) return false
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false
    if (selectedColor !== "all" && item.color !== selectedColor) return false
    if (selectedStatus === "sold" && !item.sellStatus) return false
    if (selectedStatus === "unsold" && item.sellStatus) return false
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

  const colorCounts: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    const color = item.color || "Unknown"
    colorCounts[color] = (colorCounts[color] || 0) + 1
  })
  const vehiclesByColorData = Object.entries(colorCounts)
    .map(([color, count]) => ({ name: color, value: count }))
    .sort((a, b) => b.value - a.value)

  const mileageRanges = [
    { range: "[0, 58000]", min: 0, max: 58000 },
    { range: "[58000, 116000]", min: 58000, max: 116000 },
    { range: "[116000, 174000]", min: 116000, max: 174000 },
  ]
  const mileageDistribution = mileageRanges.map((range) => {
    const count = filteredData.filter((item: any) => item.mileage >= range.min && item.mileage <= range.max).length
    return { range: range.range, count }
  })

  const reconEstheticByModel: Record<string, any> = {}
  filteredData.forEach((item: any) => {
    const model = item.model || "Unknown"
    if (!reconEstheticByModel[model]) {
      reconEstheticByModel[model] = {
        model,
        RECON: 0,
        ESTHÉTIQUE: 0,
        TRANSPORT: 0,
      }
    }
    reconEstheticByModel[model].RECON += item.reconciliation || 0
    reconEstheticByModel[model].ESTHÉTIQUE += item.adjustment || 0
    reconEstheticByModel[model].TRANSPORT += item.transport || 0
  })

  const dataByModel: Record<string, any> = {}
  filteredData.forEach((item: any) => {
    const model = item.model || "Unknown"
    if (!dataByModel[model]) {
      dataByModel[model] = {
        model,
        coutantTotal: 0,
        profitPotentiel: 0,
        mileage: 0,
        count: 0,
        prixAchat: 0,
        prixAffiche: 0,
        blackBook: 0,
      }
    }
    dataByModel[model].coutantTotal += item.costTotal || 0
    dataByModel[model].profitPotentiel += item.potentialProfit || 0
    dataByModel[model].mileage += item.mileage || 0
    dataByModel[model].count += 1
    dataByModel[model].prixAchat += item.purchasePrice || 0
    dataByModel[model].prixAffiche += item.displayedPrice || 0
    dataByModel[model].blackBook += item.blackBook || 0
  })

  const profitMarginByModel = Object.values(dataByModel).map((item: any) => {
    const marginPercent = item.prixAffiche > 0 ? ((item.profitPotentiel / item.prixAffiche) * 100).toFixed(1) : 0
    return {
      ...item,
      marginPercent: Number(marginPercent),
    }
  })

  const kilometrageByModel = Object.values(dataByModel).map((item: any) => ({
    model: item.model,
    averageKilometrage: item.count > 0 ? Math.round(item.mileage / item.count) : 0,
  }))

  const reserveTrue = filteredData.filter((item: any) => item.reserve === true).length
  const reserveFalse = filteredData.length - reserveTrue
  const reserveStatusData = [
    { name: "TRUE", value: reserveTrue },
    { name: "FALSE", value: reserveFalse },
  ]

  const chartData = Object.values(dataByModel)
  // const soldCount = filteredData.filter((item: any) => item.sellStatus).length
  // const unsoldCount = filteredData.length - soldCount
  // const statusData = [
  //   { name: "Sold", value: soldCount },
  //   { name: "Unsold", value: unsoldCount },
  // ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-card/50 backdrop-blur">
        <div className="px-8 py-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
      </header>

      <div className="p-8 space-y-8">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              {t.stats}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t.totalPrixAchat, value: metrics.totalPrixAchat, gradient: "from-blue-600 to-blue-400" },
                { label: t.totalRecon, value: metrics.totalRecon, gradient: "from-purple-600 to-purple-400" },
                { label: t.totalEsthetique, value: metrics.totalEsthetique, gradient: "from-pink-600 to-pink-400" },
                { label: t.totalTransport, value: metrics.totalTransport, gradient: "from-amber-600 to-amber-400" },
                { label: t.coutantTotal, value: metrics.coutantTotal, gradient: "from-emerald-600 to-emerald-400" },
                { label: t.acceCredit, value: metrics.acceCredit, gradient: "from-cyan-600 to-cyan-400" },
                { label: t.prixAffiche, value: metrics.prixAffiche, gradient: "from-rose-600 to-rose-400" },
                { label: t.profitPotentiel, value: metrics.profitPotentiel, gradient: "from-teal-600 to-teal-400" },
              ].map((stat) => (
                <Card key={stat.label} className={`bg-gradient-to-br ${stat.gradient} border-0 shadow-lg`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ${stat.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t.filters}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Select
                  value={selectedBrand}
                  onValueChange={(val) => {
                    setSelectedBrand(val)
                    setSelectedModel("all")
                  }}
                >
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

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.category}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.color}</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {colors.map((color: any) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!trackerLoading && (
          <>
            {/* 1. COUTANT TOTAL by Model */}
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
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="coutantTotal" fill="#3b82f6" name="Coutant Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. PROFIT POTENTIEL by Model */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>{t.profitPotentielByModel}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="profitPotentiel" fill="#ec4899" name="Profit Potentiel" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 3. KILOMÉTRAGE by Model */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>{t.kilometrageByModel}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kilometrageByModel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${value.toLocaleString()} km`} />
                    <Bar dataKey="averageKilometrage" fill="#10b981" name="Average Kilométrage" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4. Sum totals shown at top */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>{t.sumTotals}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-400 border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white">{t.coutantTotal}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">
                        ${metrics.coutantTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-600 to-pink-400 border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white">{t.profitPotentiel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">
                        ${metrics.profitPotentiel.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 5. PURCHASE COST VS LISTED PRICE */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>{t.purchaseCostVsPrice}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="prixAchat" fill="#000000" name="Prix Achat" />
                      <Bar dataKey="prixAffiche" fill="#3b82f6" name="Prix Affiche" />
                      <Bar dataKey="blackBook" fill="#6b7280" name="Black Book" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 6. PROFIT % MARGIN BY MODEL */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>{t.profitMarginByModel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={profitMarginByModel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                      <YAxis label={{ value: "Profit %", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value: any) => `${value}%`} />
                      <Line
                        type="monotone"
                        dataKey="marginPercent"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", r: 5 }}
                        name="Profit %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 7. VEHICALS BY COLOUR */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>{t.vehiclesByColor}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={vehiclesByColorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {vehiclesByColorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 8. Mileage Distribution */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>{t.mileageDistribution}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mileageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Vehicle Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 9. Recon / Esthétique / Transport Spend by Vehicle */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>{t.reconEstheticTransport}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={Object.values(reconEstheticByModel)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="RECON" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="ESTHÉTIQUE" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="TRANSPORT" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 10. Total Cost Breakdown and Reserve Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 10a. Total Cost Breakdown */}
              <Card className="bg-card/50 backdrop-blur border-border/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t.totalCostBreakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="coutantTotal" fill="#9333ea" name="Total Cost" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 11. Reserve Status Summary - Made smaller to take 1/3 width */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">{t.reserveStatusSummary}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reserveStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reserveStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* 12. Sum of Coutant Total & Profit Potentiel by Model - New chart */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Sum of Coutant Total & Profit Potentiel by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `$${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Bar dataKey="coutantTotal" fill="#3b82f6" name="Sum of COUTANT TOTAL" />
                    <Bar dataKey="profitPotentiel" fill="#10b981" name="Sum of PROFIT POTENTIEL" />
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
