"use client"

import { useState } from "react"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/hooks/use-language"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function LedgerPage() {
  const { language } = useLanguage()
  const { data: ledgerData = [], isLoading } = useSWR("/api/ledger", fetcher)
  const { data: salesmen = [] } = useSWR("/api/salesmen", fetcher)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSalesman, setSelectedSalesman] = useState<string>("")
  const itemsPerPage = 10

  const labels = {
    en: {
      title: "Ledger",
      subtitle: "Commission tracking and payment records",
      date: "Date",
      commissionDue: "Commission Due",
      payment: "Payment",
      balance: "Balance",
      noRecords: "No ledger records found",
      showing: "Showing",
      of: "of",
      records: "records",
      filterBySalesman: "Filter by Salesman",
      allSalesmen: "All Salesmen",
    },
    fr: {
      title: "Ledger",
      subtitle: "Suivi des commissions et enregistrements de paiement",
      date: "Date",
      commissionDue: "Commission Due",
      payment: "Paiement",
      balance: "Solde",
      noRecords: "Aucun enregistrement du ledger trouvé",
      showing: "Affichage",
      of: "de",
      records: "enregistrements",
      filterBySalesman: "Filtrer par vendeur",
      allSalesmen: "Tous les vendeurs",
    },
  }

  const t = labels[language as keyof typeof labels]

  // Helpers to normalize commission rate (support both 0.05 and 5 formats)
  const normalizeRate = (rate: number) => {
    if (!isFinite(rate)) return 0
    return rate > 1 ? rate / 100 : rate // treat >1 as percentage (e.g. 5 => 0.05)
  }

  const getCommissionRateForEntry = (entry: any) => {
    // Prefer a commissionRate on the ledger entry
    if (entry?.commissionRate != null) return normalizeRate(Number(entry.commissionRate))

    // Try to lookup salesman by name or id
    const name = entry?.name || entry?.salesmanName || ""
    const found = salesmen.find((s: any) => s.name === name || s._id === name)
    if (found && found.commissionRate != null) return normalizeRate(Number(found.commissionRate))

    // fallback default rate
    return 0
  }

  // This matches the calculation in the tracker page where commission = totalProfit * (commissionRate / 100)
  const enrichedData = (ledgerData || []).map((entry: any) => {
    const profit = Number(entry?.profitTotal ?? entry?.profit ?? 0)
    const rate = getCommissionRateForEntry(entry)
    const commissionDue = profit * rate // Same formula as tracker page
    const paymentMade = entry.paymentMade || 0
    const balance = commissionDue - paymentMade
    return {
      ...entry,
      commissionDue,
      paymentMade,
      balance,
    }
  })

  const filteredData = selectedSalesman
    ? enrichedData.filter((entry: any) => entry.name === selectedSalesman)
    : enrichedData

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const paginatedData = filteredData.slice(startIdx, endIdx)

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-lg">
        <div className="px-4 md:px-8 py-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t.title}
            </h2>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t.title}</CardTitle>
              <div className="flex items-center gap-2">
                <label htmlFor="salesman-filter" className="text-sm font-medium text-muted-foreground">
                  {t.filterBySalesman}:
                </label>
                <select
                  id="salesman-filter"
                  value={selectedSalesman}
                  onChange={(e) => {
                    setSelectedSalesman(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-sm border rounded-md border-border bg-background text-foreground"
                >
                  <option value="">{t.allSalesmen}</option>
                  {salesmen.map((salesman: any) => (
                    <option key={salesman._id} value={salesman.name}>
                      {salesman.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : enrichedData.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div>
                <div className="w-full overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-20">
                      <TableRow>
                        <TableHead className="whitespace-nowrap py-2 px-3">{t.date}</TableHead>
                        <TableHead className="whitespace-nowrap py-2 px-3 text-right">{t.commissionDue}</TableHead>
                        <TableHead className="whitespace-nowrap py-2 px-3 text-right">{t.payment}</TableHead>
                        <TableHead className="whitespace-nowrap py-2 px-3 text-right">{t.balance}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((entry: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="whitespace-nowrap text-xs py-2 px-3">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs py-2 px-3 text-right">
                            {formatCurrency(entry.commissionDue || 0)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs py-2 px-3 text-right">
                            {formatCurrency(entry.paymentMade || 0)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs py-2 px-3 text-right font-medium">
                            {formatCurrency(entry.balance || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      {t.showing} {startIdx + 1}-{Math.min(endIdx, filteredData.length)} {t.of} {filteredData.length}{" "}
                      {t.records}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const pageNum = i + 1
                          if (pageNum > totalPages) return null
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
