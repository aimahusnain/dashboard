"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLUMNS = [
  "datePurchase",
  "action",
  "stockNo",
  "category",
  "year",
  "make",
  "model",
  "mileage",
  "color",
  "purchasePrice",
  "reconciliation",
  "estethique",
  "transport",
  "adjustment",
  "costTotal",
  "accessCredit",
  "displayedPrice",
  "potentialProfit",
  "blackBook",
  "reserve",
  "customerName",
  "saleDate",
  "paid",
  "arbitration",
  "variableGrossProfit",
  "costGP",
  "prGP",
  "rebate",
  "vassCost",
  "cost",
  "prAss",
  "miscellaneousExpenses",
  "totalProfit",
  "commission",
  "netProfit",
  "salesperson",
  "notes",
]

const COLUMN_LABELS = {
  datePurchase: "Date Purchase",
  action: "Action",
  stockNo: "# Stock (NIV)",
  category: "Category",
  year: "Year",
  make: "Make",
  model: "Model",
  mileage: "Mileage",
  color: "Color",
  purchasePrice: "Purchase Price",
  reconciliation: "Reconciliation",
  estethique: "Esthétique",
  transport: "Transport",
  adjustment: "Adjustment",
  costTotal: "Cost Total",
  accessCredit: "Access Credit",
  displayedPrice: "Displayed Price",
  potentialProfit: "Potential Profit",
  blackBook: "Black Book",
  reserve: "Reserve",
  customerName: "Customer Name",
  saleDate: "Sale Date",
  paid: "Paid",
  arbitration: "Arbitration",
  variableGrossProfit: "Variable Gross Profit",
  costGP: "Cost GP",
  prGP: "PR GP",
  rebate: "Rebate",
  vassCost: "V ASS Cost",
  cost: "Cost",
  prAss: "PR ASS",
  miscellaneousExpenses: "Miscellaneous Expenses",
  totalProfit: "Total Profit",
  commission: "Commission",
  netProfit: "Net Profit",
  salesperson: "Salesperson",
  notes: "Notes",
}

export default function InventoryPage() {
  const { language } = useLanguage()
  const { data: allTracker = [], isLoading } = useSWR("/api/tracker", fetcher)
  const { data: validations = [] } = useSWR("/api/validations", fetcher)
  const [showDialog, setShowDialog] = useState(false)
  console.log(showDialog)
  const labels = {
    en: {
      title: "Inventory",
      subtitle: "Manage active vehicles in stock",
      recordsTitle: "Inventory Records",
      budgetTitle: "Budget Summary by Category",
      category: "Category",
      count: "Count",
      amount: "Amount $",
      budgetCap: "Budget Cap",
      disponible: "Disponible",
      noRecords: "No vehicles in inventory",
      totalInventory: "Total Inventory Value",
    },
    fr: {
      title: "Inventaire",
      subtitle: "Gérer les véhicules actifs en stock",
      recordsTitle: "Enregistrements d'inventaire",
      budgetTitle: "Résumé du budget par catégorie",
      category: "Catégorie",
      count: "Nombre",
      amount: "Montant $",
      budgetCap: "Plafond budgétaire",
      disponible: "Disponible",
      noRecords: "Aucun véhicule en inventaire",
      totalInventory: "Valeur totale de l'inventaire",
    },
  }

  const t = labels[language as keyof typeof labels]

  // Filter only unsold vehicles (sellStatus = false)
  const inventoryItems = allTracker.filter((entry: any) => entry.sellStatus === false)

  const validationCategories = Array.from(new Set(validations.map((v: any) => v.category).filter(Boolean))).sort()

  const budgetSummary = inventoryItems.reduce((acc: any, item: any) => {
    const category = validationCategories.includes(item.category) ? item.category : "Uncategorized"
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

  const budgetData = validationCategories
    .map((category:any) => {
      const data = budgetSummary[category] || { count: 0, amount: 0 }
      const budgetCaps: Record<string, number> = {
        "1": 25000,
        "2": 150000,
        "3": 125000,
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
    .concat(
      // Add uncategorized if there are any
      budgetSummary["Uncategorized"]
        ? [
            {
              category: "Uncategorized",
              count: budgetSummary["Uncategorized"].count,
              amount: budgetSummary["Uncategorized"].amount.toFixed(2),
              budgetCap: 100000,
              disponible: (100000 - budgetSummary["Uncategorized"].amount).toFixed(2),
            },
          ]
        : [],
    )

  const totalAmount = inventoryItems.reduce((sum: number, item: any) => sum + (item.costTotal || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-8 py-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.title}
            </h2>
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
              <div className="space-y-4">
                <Button
                  onClick={async () => {
                    if (window.confirm("Delete all budget entries?")) {
                      try {
                        await fetch("/api/tracker?budget=true", { method: "DELETE" })
                        // Refresh page
                        window.location.reload()
                      } catch (error) {
                        console.error("Error:", error)
                      }
                    }
                  }}
                  variant="destructive"
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm"
                >
                  <Trash2 size={18} />
                  Delete All Records
                </Button>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-20">
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
                          <TableCell className="text-right font-medium">
                            $
                            {Number.parseFloat(row.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">${row.budgetCap.toLocaleString("en-US")}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${Number.parseFloat(row.disponible) < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            $
                            {Number.parseFloat(row.disponible).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{inventoryItems.length}</TableCell>
                        <TableCell className="text-right">
                          ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {budgetData.reduce((sum: number, row: any) => sum + row.budgetCap, 0).toLocaleString("en-US")}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {(
                            budgetData.reduce((sum: number, row: any) => sum + row.budgetCap, 0) - totalAmount
                          ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
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
              <div className="space-y-4">
                <Button
                  onClick={async () => {
                    if (window.confirm("Delete all inventory entries?")) {
                      try {
                        await fetch("/api/tracker?inventory=true", { method: "DELETE" })
                        // Refresh page
                        window.location.reload()
                      } catch (error) {
                        console.error("Error:", error)
                      }
                    }
                  }}
                  variant="destructive"
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm"
                >
                  <Trash2 size={18} />
                  Delete All Records
                </Button>
                <div className="w-full overflow-x-auto">
                  <div className="max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                     
                      <TableHeader className="sticky top-0 bg-card z-20">
                          <TableRow className="font-bold bg-muted/50 sticky bottom-0">
                          {COLUMNS.map((col) => {
                            const totalColumns = [
                              "purchasePrice",
                              "reconciliation",
                              "estethique",
                              "transport",
                              "adjustment",
                              "costTotal",
                              "accessCredit",
                              "blackBook",
                              "displayedPrice",
                              "potentialProfit",
                            ]

                            if (totalColumns.includes(col)) {
                              const total = inventoryItems.reduce((sum: number, item: any) => {
                                return sum + (Number(item[col]) || 0)
                              }, 0)
                              return (
                                <TableCell key={`total-${col}`} className="text-right whitespace-nowrap">
                                  $
                                  {total.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </TableCell>
                              )
                            }

                            if (col === "category") {
                              return (
                                <TableCell key={`total-${col}`} className="whitespace-nowrap">
                                  Total
                                </TableCell>
                              )
                            }

                            return (
                              <TableCell key={`total-${col}`} className="whitespace-nowrap">
                                -
                              </TableCell>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          {COLUMNS.map((col) => (
                            <TableHead key={col} className="whitespace-nowrap">
                              {COLUMN_LABELS[col as keyof typeof COLUMN_LABELS]}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryItems.map((entry: any) => (
                          <TableRow key={entry._id}>
                            {COLUMNS.map((col) => (
                              <TableCell key={`${entry._id}-${col}`} className="whitespace-nowrap text-xs">
                                {col === "paid" || col === "reserve" ? (
                                  <Checkbox checked={entry[col]} disabled />
                                ) : (
                                  entry[col] || ""
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                       
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
