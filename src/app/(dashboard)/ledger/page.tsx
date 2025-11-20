"use client"

import { useState, useEffect } from "react"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/hooks/use-language"
import React from "react"

interface Salesman {
  id: string
  name: string
  commissionRate: number
}

interface LedgerEntry {
  name: string
  date: string
  profitTotal: number
  commissionDue: number
  paymentMade: number
  balance: number
  type: 'sale' | 'payment'
}

export default function LedgerPage() {
  const { language } = useLanguage()

  const [salesmen, setSalesmen] = useState<Salesman[]>([])
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      loading: "Loading ledger data...",
      errorLoading: "Error loading ledger data",
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
      loading: "Chargement des données du ledger...",
      errorLoading: "Erreur lors du chargement des données du ledger",
    },
  }

  const t = labels[language as keyof typeof labels]

  useEffect(() => {
    fetchLedgerData()
  }, [selectedSalesman])

  const fetchLedgerData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedSalesman) {
        params.append('salesman', selectedSalesman)
      }

      const response = await fetch(`/api/ledger?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setSalesmen(result.data.salesmen)
        setLedgerData(result.data.ledgerEntries)
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = ledgerData

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const paginatedData = filteredData.slice(startIdx, endIdx)

  const formatDate = (date: string | Date) => {
    if (!date) return "Blank Date"
    return new Date(date).toLocaleDateString(
      language === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "2-digit", day: "2-digit" }
    )
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
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </div>
      </header>

      <div className="p-4 md:p-8">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t.title}</CardTitle>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t.filterBySalesman}:
                </label>

                <select
                  value={selectedSalesman}
                  onChange={(e) => {
                    setSelectedSalesman(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-sm border rounded-md border-border bg-background text-foreground"
                  disabled={loading}
                >
                  <option value="">{t.allSalesmen}</option>
                  {salesmen.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t.loading}</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive text-sm">{t.errorLoading}</p>
                <p className="text-muted-foreground text-xs mt-2">{error}</p>
                <Button onClick={fetchLedgerData} variant="outline" size="sm" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : filteredData.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div>
                <div className="w-full overflow-x-auto border rounded-lg">
               <Table>
  <TableHeader className="sticky top-0 bg-card z-20">
    <TableRow>
      <TableHead className="py-2 px-3">{t.date}</TableHead>
      <TableHead className="py-2 px-3 text-right">{t.commissionDue}</TableHead>
      <TableHead className="py-2 px-3 text-right">{t.payment}</TableHead>
      <TableHead className="py-2 px-3 text-right">{t.balance}</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {(() => {
      let runningBalance = 0; // start from 0

      return paginatedData.map((entry, idx) => {
        // Add commission first
        runningBalance += entry.commissionDue ?? 0;
        const balanceAfterCommission = runningBalance;

        // Then subtract payment
        runningBalance -= entry.paymentMade ?? 0;
        const balanceAfterPayment = runningBalance;

        return (
          <React.Fragment key={idx}>
            {/* Commission row */}
            <TableRow>
              <TableCell className="text-xs py-2 px-3">{formatDate(entry.date)}</TableCell>
              <TableCell className="text-xs py-2 px-3 text-right">
                {formatCurrency(entry.commissionDue ?? 0)}
              </TableCell>
              <TableCell className="text-xs py-2 px-3 text-right"></TableCell>
              <TableCell className="text-xs py-2 px-3 text-right font-medium">
                {formatCurrency(balanceAfterCommission)}
              </TableCell>
            </TableRow>

            {/* Payment row */}
            <TableRow>
              <TableCell className="text-xs py-2 px-3"></TableCell>
              <TableCell className="text-xs py-2 px-3 text-right"></TableCell>
              <TableCell className="text-xs py-2 px-3 text-right">
                {formatCurrency(entry.paymentMade ?? 0)}
              </TableCell>
              <TableCell className="text-xs text-red-400 py-2 px-3 text-right font-medium">
                {formatCurrency(balanceAfterPayment)}
              </TableCell>
            </TableRow>
          </React.Fragment>
        );
      });
    })()}
  </TableBody>
</Table>

                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      {t.showing} {startIdx + 1}-{Math.min(endIdx, filteredData.length)}{" "}
                      {t.of} {filteredData.length} {t.records}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft size={16} /> Previous
                      </Button>

                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}

                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next <ChevronRight size={16} />
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