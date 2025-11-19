'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart, PieChart } from 'recharts'
import { Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#14b8a6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background rounded-lg p-3 shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedModel, setSelectedModel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const { data: tracker = [], isLoading: trackerLoading } = useSWR('/api/tracker', fetcher)

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

  // ============ INVENTORY SECTION ============
  
  // Inventory by Brand
  const inventoryByBrand: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    const brand = item.make || 'Unknown'
    inventoryByBrand[brand] = (inventoryByBrand[brand] || 0) + 1
  })
  const chartInventoryByBrand = Object.entries(inventoryByBrand)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Inventory by Model
  const inventoryByModel: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    const model = item.model || 'Unknown'
    inventoryByModel[model] = (inventoryByModel[model] || 0) + 1
  })
  const chartInventoryByModel = Object.entries(inventoryByModel)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Inventory Value by Brand
  const inventoryValueByBrand: Record<string, any> = {}
  filteredData.forEach((item: any) => {
    const brand = item.make || 'Unknown'
    if (!inventoryValueByBrand[brand]) {
      inventoryValueByBrand[brand] = { brand, value: 0 }
    }
    inventoryValueByBrand[brand].value += (item.displayedPrice || 0)
  })
  const chartInventoryValue = Object.values(inventoryValueByBrand)
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10)

  // Cars by Year
  const carsByYear: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    const year = item.year?.toString() || 'Unknown'
    carsByYear[year] = (carsByYear[year] || 0) + 1
  })
  const chartCarsByYear = Object.entries(carsByYear)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(b.name) - parseInt(a.name))
    .slice(0, 15)

  // Inventory Color Distribution
  const colorDistribution: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    const color = item.color || 'Unknown'
    colorDistribution[color] = (colorDistribution[color] || 0) + 1
  })
  const chartColorDistribution = Object.entries(colorDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // ============ SALES SECTION ============

  // Sales by Brand
  const salesByBrand: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    if (item.sellStatus) {
      const brand = item.make || 'Unknown'
      salesByBrand[brand] = (salesByBrand[brand] || 0) + 1
    }
  })
  const chartSalesByBrand = Object.entries(salesByBrand)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  // Sales by Model
  const salesByModel: Record<string, number> = {}
  filteredData.forEach((item: any) => {
    if (item.sellStatus) {
      const model = item.model || 'Unknown'
      salesByModel[model] = (salesByModel[model] || 0) + 1
    }
  })
  const chartSalesByModel = Object.entries(salesByModel)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Sell Status (Sold vs Unsold)
  const soldCount = filteredData.filter((item: any) => item.sellStatus).length
  const unsoldCount = filteredData.length - soldCount
  const sellStatusData = [
    { name: 'Sold', value: soldCount, fill: '#10b981' },
    { name: 'Unsold', value: unsoldCount, fill: '#ef4444' }
  ]

  // Net Profit per Car
  const netProfitPerCar = Object.entries(
    filteredData.reduce((acc: any, item: any) => {
      const model = item.model || 'Unknown'
      if (!acc[model]) {
        acc[model] = { model, totalProfit: 0, count: 0, avgProfit: 0 }
      }
      acc[model].totalProfit += item.potentialProfit || 0
      acc[model].count += 1
      acc[model].avgProfit = acc[model].totalProfit / acc[model].count
      return acc
    }, {})
  ).map(( data: any) => data)
    .sort((a: any, b: any) => b.avgProfit - a.avgProfit)
    .slice(0, 10)

  // Expenses Breakdown
  const expensesData: Record<string, any> = {}
  filteredData.forEach((item: any) => {
    const category = item.expenseCategory || 'Unknown'
    if (!expensesData[category]) {
      expensesData[category] = { category, value: 0 }
    }
    expensesData[category].value += (item.expenseAmount || 0)
  })
    .sort((a: any, b: any) => b.value - a.value)

  // ============ COST & MILEAGE SECTION (existing) ============

  const dataByModel: Record<string, any> = {}
  filteredData.forEach((item: any) => {
    const model = item.model || 'Unknown'
    if (!dataByModel[model]) {
      dataByModel[model] = {
        model,
        coutantTotal: 0,
        profitPotentiel: 0,
        mileage: 0,
        purchasePrice: 0,
        displayedPrice: 0,
        count: 0,
      }
    }
    dataByModel[model].coutantTotal += item.costTotal || 0
    dataByModel[model].profitPotentiel += item.potentialProfit || 0
    dataByModel[model].mileage += item.mileage || 0
    dataByModel[model].purchasePrice += item.purchasePrice || 0
    dataByModel[model].displayedPrice += item.displayedPrice || 0
    dataByModel[model].count += 1
  })

  const chartDataByModel = Object.values(dataByModel).sort((a: any, b: any) => b.coutantTotal - a.coutantTotal)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard Analytics</h1>
        <p className="text-muted-foreground text-lg">Comprehensive sales, inventory & performance insights</p>
      </header>

      {/* Filters */}
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Brand</label>
              <Select value={selectedBrand} onValueChange={(val) => {
                setSelectedBrand(val)
                setSelectedModel('all')
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="unsold">Unsold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!trackerLoading && (
        <div className="space-y-12">
          {/* ============ COST & MILEAGE ANALYSIS (MOVED TO TOP) ============ */}
          <section>
            <h2 className="text-2xl font-bold mb-6">📊 Cost & Mileage Analysis by Model</h2>
            <div className="grid grid-cols-1  gap-8">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Coutant Total by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartDataByModel.filter((item: any) => item.model !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} interval={chartDataByModel.length > 10 ? Math.floor(chartDataByModel.length / 10) : 0} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="coutantTotal" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Kilométrage by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartDataByModel.filter((item: any) => item.model !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} interval={chartDataByModel.length > 10 ? Math.floor(chartDataByModel.length / 10) : 0} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="mileage" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Profit Potentiel by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartDataByModel.filter((item: any) => item.model !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} interval={chartDataByModel.length > 10 ? Math.floor(chartDataByModel.length / 10) : 0} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="profitPotentiel" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ============ INVENTORY DASHBOARD ============ */}
          <section>
            <h2 className="text-2xl font-bold mb-6">📦 Inventory Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Inventory by Brand (Count)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartInventoryByBrand.filter((item: any) => item.name !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Inventory by Model (Count)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartInventoryByModel.filter((item: any) => item.name !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#8b5cf6" name="Units" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Inventory Value by Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartInventoryValue.filter((item: any) => item.brand !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="brand" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#ec4899" name="Total Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Cars by Year (Histogram)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartCarsByYear.filter((item: any) => item.name !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#f59e0b" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Inventory Color Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={chartColorDistribution.filter((item: any) => item.name !== 'Unknown')} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} dataKey="value">
                        {chartColorDistribution.filter((item: any) => item.name !== 'Unknown').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ============ SALES DASHBOARD ============ */}
          <section>
            <h2 className="text-2xl font-bold mb-6">🛍️ Sales Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Sales by Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartSalesByBrand.filter((item: any) => item.name !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#3b82f6" name="Sold Units" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Sales by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartSalesByModel.filter((item: any) => item.name !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#f59e0b" name="Sold Units" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Sell Status: Sold vs Unsold</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={sellStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} dataKey="value">
                        {sellStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ============ ADDITIONAL INSIGHTS ============ */}
          <section>
  
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Net Profit per Car (by Model)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={netProfitPerCar.filter((item: any) => item.model !== 'Unknown')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgProfit" fill="#06b6d4" name="Avg Profit per Unit" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
          </section>
        </div>
      )}
    </div>
  )
}
