"use client"

import { Loader2, Trash2 } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/hooks/use-language"

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
  "transport",
  "adjustment",
  "costTotal",
  "accessCredit",
  "displayedPrice",
  "potentialProfit",
  "customerName",
  "saleDate",
  "paid",
  "arbitration",
  "variableGrossProfit",
  "costGP",
  "prGP",
  "rebate",
  "vassCost",
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
  transport: "Transport",
  adjustment: "Adjustment",
  costTotal: "Cost Total",
  accessCredit: "Access Credit",
  displayedPrice: "Displayed Price",
  potentialProfit: "Potential Profit",
  customerName: "Customer Name",
  saleDate: "Sale Date",
  paid: "Paid",
  arbitration: "Arbitration",
  variableGrossProfit: "Variable Gross Profit",
  costGP: "Cost GP",
  prGP: "PR GP",
  rebate: "Rebate",
  vassCost: "V ASS Cost",
  prAss: "PR ASS",
  miscellaneousExpenses: "Miscellaneous Expenses",
  totalProfit: "Total Profit",
  commission: "Commission",
  netProfit: "Net Profit",
  salesperson: "Salesperson",
  notes: "Notes",
}

const TOTALS_COLUMNS = ["purchasePrice", "costTotal", "displayedPrice", "potentialProfit", "netProfit"]

const handleDeleteAll = async (mutate: any) => {
  if (window.confirm("Are you sure you want to delete ALL sold records? This action cannot be undone.")) {
    try {
      await fetch("/api/tracker?sold=true", { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Error deleting all sold entries:", error)
    }
  }
}

export default function SoldPage() {
  const { language } = useLanguage()
  const { data: allTracker = [], isLoading, mutate } = useSWR("/api/tracker", fetcher)

  const labels = {
    en: {
      title: "Sold Vehicles",
      subtitle: "View all sold vehicles",
      records: "Sold Records",
      noRecords: "No sold vehicles yet",
      delete: "Delete",
      totals: "Totals",
    },
    fr: {
      title: "Véhicules vendus",
      subtitle: "Voir tous les véhicules vendus",
      records: "Enregistrements vendus",
      noRecords: "Aucun véhicule vendu pour le moment",
      delete: "Supprimer",
      totals: "Totaux",
    },
  }

  const t = labels[language as keyof typeof labels]

  const soldTracker = allTracker.filter((entry: any) => entry.sellStatus === true)

  const calculateTotals = () => {
    const totals: Record<string, number> = {}
    TOTALS_COLUMNS.forEach((col) => {
      totals[col] = soldTracker.reduce((sum: number, entry: any) => {
        const val = Number.parseFloat(entry[col]) || 0
        return sum + val
      }, 0)
    })
    return totals
  }

  const totals = calculateTotals()

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tracker/${id}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Error deleting tracker entry:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-4 md:px-8 py-8">
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>{t.records}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : soldTracker.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {soldTracker.length > 0 && (
                  <Button
                    onClick={() => handleDeleteAll(mutate)}
                    variant="destructive"
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm w-fit"
                  >
                    <Trash2 size={18} />
                    Delete All Sold Records
                  </Button>
                )}
                <div className="w-full overflow-x-auto">
                  <div className="max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-20">
                        <TableRow className="bg-yellow-50 dark:bg-yellow-950 border-b-2">
                          <TableHead className="py-2 px-3 font-bold text-yellow-900 dark:text-yellow-100">
                            {t.totals}
                          </TableHead>
                          {COLUMNS.map((col) => (
                            <TableHead
                              key={`total-${col}`}
                              className="whitespace-nowrap py-2 px-3 text-yellow-900 dark:text-yellow-100 font-bold"
                            >
                              {TOTALS_COLUMNS.includes(col)
                                ? `$${totals[col]?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`
                                : ""}
                            </TableHead>
                          ))}
                          <TableHead className="py-2 px-3"></TableHead>
                        </TableRow>
                        <TableRow>
                          {COLUMNS.map((col) => (
                            <TableHead key={col} className="whitespace-nowrap">
                              {COLUMN_LABELS[col as keyof typeof COLUMN_LABELS]}
                            </TableHead>
                          ))}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {soldTracker.map((entry: any) => (
                          <TableRow key={entry._id}>
                            {COLUMNS.map((col) => (
                              <TableCell key={`${entry._id}-${col}`} className="whitespace-nowrap text-xs">
                                {col === "paid" ? <span>{entry[col] || "—"}</span> : entry[col] || ""}
                              </TableCell>
                            ))}
                            <TableCell className="sticky right-0 bg-card">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </TableCell>
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
