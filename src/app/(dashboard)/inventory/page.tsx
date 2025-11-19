'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLUMNS = [
  'datePurchase', 'action', 'stockNo', 'category', 'year', 'make', 'model', 'mileage',
  'color', 'purchasePrice', 'reconciliation', 'transport', 'adjustment', 'costTotal',
  'accessCredit', 'displayedPrice', 'potentialProfit', 'customerName',
  'saleDate', 'paid', 'arbitration', 'variableGrossProfit', 'costGP', 'prGP', 'rebate',
  'vassCost', 'prAss', 'miscellaneousExpenses', 'totalProfit', 'commission', 'netProfit',
  'salesperson', 'notes'
]

const COLUMN_LABELS = {
  datePurchase: 'Date Purchase',
  action: 'Action',
  stockNo: '# Stock (NIV)',
  category: 'Category',
  year: 'Year',
  make: 'Make',
  model: 'Model',
  mileage: 'Mileage',
  color: 'Color',
  purchasePrice: 'Purchase Price',
  reconciliation: 'Reconciliation',
  transport: 'Transport',
  adjustment: 'Adjustment',
  costTotal: 'Cost Total',
  accessCredit: 'Access Credit',
  displayedPrice: 'Displayed Price',
  potentialProfit: 'Potential Profit',
  customerName: 'Customer Name',
  saleDate: 'Sale Date',
  paid: 'Paid',
  arbitration: 'Arbitration',
  variableGrossProfit: 'Variable Gross Profit',
  costGP: 'Cost GP',
  prGP: 'PR GP',
  rebate: 'Rebate',
  vassCost: 'V ASS Cost',
  prAss: 'PR ASS',
  miscellaneousExpenses: 'Miscellaneous Expenses',
  totalProfit: 'Total Profit',
  commission: 'Commission',
  netProfit: 'Net Profit',
  salesperson: 'Salesperson',
  notes: 'Notes'
}

export default function InventoryPage() {
  const { language } = useLanguage()
  const { data: allTracker = [], isLoading } = useSWR('/api/tracker', fetcher)
  const [showDialog, setShowDialog] = useState(false)
console.log(showDialog)
  const labels = {
    en: {
      title: 'Inventory',
      subtitle: 'Manage active vehicles in stock',
      recordsTitle: 'Inventory Records',
      budgetTitle: 'Budget Summary by Category',
      category: 'Category',
      count: 'Count',
      amount: 'Amount $',
      budgetCap: 'Budget Cap',
      disponible: 'Disponible',
      noRecords: 'No vehicles in inventory',
      totalInventory: 'Total Inventory Value',
    },
    fr: {
      title: 'Inventaire',
      subtitle: 'Gérer les véhicules actifs en stock',
      recordsTitle: 'Enregistrements d\'inventaire',
      budgetTitle: 'Résumé du budget par catégorie',
      category: 'Catégorie',
      count: 'Nombre',
      amount: 'Montant $',
      budgetCap: 'Plafond budgétaire',
      disponible: 'Disponible',
      noRecords: 'Aucun véhicule en inventaire',
      totalInventory: 'Valeur totale de l\'inventaire',
    }
  }

  const t = labels[language as keyof typeof labels]

  // Filter only unsold vehicles (sellStatus = false)
  const inventoryItems = allTracker.filter((entry: any) => entry.sellStatus === false)

  const budgetSummary = inventoryItems.reduce((acc: any, item: any) => {
    const category = item.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        amount: 0,
      }
    }
    acc[category].count += 1
    acc[category].amount += item.costTotal || 0
    return acc
  }, {})

  const budgetData = Object.entries(budgetSummary).map(([category, data]: any) => {
    const budgetCaps: Record<string, number> = {
      '1': 25000,
      '2': 150000,
      '3': 125000,
    }
    const budgetCap = budgetCaps[category] || 100000
    const disponible = budgetCap - data.amount
    return {
      category,
      count: data.count,
      amount: data.amount.toFixed(2),
      budgetCap,
      disponible: disponible.toFixed(2),
    }
  })

  const totalAmount = inventoryItems.reduce((sum: number, item: any) => sum + (item.costTotal || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-8 py-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.title}</h2>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="gap-2 r from-primary to-accent hover:opacity-90 transition-all shadow-lg"
          >
            <Plus size={20} />
            Add to Tracker
          </Button>
        </div>
      </header>

      <div className="p-8 space-y-6">
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>{t.budgetTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : budgetData.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.category}</TableHead>
                      <TableHead className="text-right">{t.count}</TableHead>
                      <TableHead className="text-right">{t.amount}</TableHead>
                      <TableHead className="text-right">{t.budgetCap}</TableHead>
                      <TableHead className="text-right">{t.disponible}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetData.map((row: any) => (
                      <TableRow key={row.category}>
                        <TableCell className="font-medium">{row.category}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right font-medium">${parseFloat(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">${row.budgetCap.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${parseFloat(row.disponible) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${parseFloat(row.disponible).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{inventoryItems.length}</TableCell>
                      <TableCell className="text-right">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">${budgetData.reduce((sum: number, row: any) => sum + row.budgetCap, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">${(budgetData.reduce((sum: number, row: any) => sum + row.budgetCap, 0) - totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Records */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>{t.recordsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : inventoryItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {COLUMNS.map(col => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {COLUMN_LABELS[col as keyof typeof COLUMN_LABELS]}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((entry: any) => (
                      <TableRow key={entry._id}>
                        {COLUMNS.map(col => (
                          <TableCell key={`${entry._id}-${col}`} className="whitespace-nowrap text-xs">
                            {col === 'paid' ? (
                              <Checkbox checked={entry[col]} disabled />
                            ) : (
                              entry[col] || ''
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
