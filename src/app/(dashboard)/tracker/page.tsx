"use client"

import { useState, useRef } from "react"
import { Loader2, Plus, Edit2, Trash2, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
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
  "esthetique",
  "transport",
  "adjustment",
  "costTotal",
  "accessCredit",
  "blackBook",
  "displayedPrice",
  "potentialProfit",
  "sellStatus",
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
  "cost", // added cost column between vassCost and prAss
  "prAss",
  "miscellaneousExpenses",
  "totalProfit",
  "commission",
  "netProfit",
  "salesperson",
  "notes",
]

const COLUMN_LABELS = {
  datePurchase: "DATE ACHAT",
  action: "ACTION",
  stockNo: "# STOCK (NIV)",
  category: "Catégories",
  year: "ANNÉE",
  make: "MARQUE",
  model: "MODÈLE",
  mileage: "KILOMÉTRAGE",
  color: "COULEUR",
  purchasePrice: "PRIX ACHAT",
  reconciliation: "RECON",
  esthetique: "ESTHÉTIQUE",
  transport: "TRANSPORT",
  adjustment: "AJUSTEMENT",
  costTotal: "COUTANT TOTAL",
  accessCredit: "ACCES CRÉDIT",
  blackBook: "Black Book",
  displayedPrice: "PRIX AFFICHÉ",
  potentialProfit: "PROFIT POTENTIEL",
  sellStatus: "Sell Status",
  reserve: "Reserve",
  customerName: "Nom du client",
  saleDate: "Date de vente",
  paid: "PAYÉ",
  arbitration: "ARBIT.",
  variableGrossProfit: "Bénéfice brut variable",
  costGP: "COST GP",
  prGP: "PR GP",
  rebate: "RISTOURNE",
  vassCost: "V ASS",
  cost: "Cost", // added cost column label
  prAss: "COST PR ASS",
  miscellaneousExpenses: "FRAIS DIVERS",
  totalProfit: "PROFIT TOTAL",
  commission: "Commission",
  netProfit: "PROFIT NET",
  salesperson: "Vendeur",
  notes: "Notes",
}

const TOTALS_COLUMNS = [
  "purchasePrice",
  "costTotal",
  "accessCredit",
  "reconciliation",
  "esthetique",
  "transport",
  "adjustment",
  "displayedPrice",
  "potentialProfit",
]

function Toast({ message, type = "success" }: { message: string; type?: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg animate-in slide-in-from-bottom-5 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  )
}

export default function TrackerPage() {
  const { language } = useLanguage()
  const { data: tracker = [], isLoading, mutate } = useSWR("/api/tracker", fetcher)
  const { data: validations = [] } = useSWR("/api/validations", fetcher)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dateFilter, setDateFilter] = useState<{ year?: string; month?: string; date?: string }>({})
  const itemsPerPage = 10
  const [formData, setFormData] = useState<Record<string, any>>({
    sellStatus: false,
    paid: 0,
    reserve: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const labels = {
    en: {
      title: "Tracker",
      subtitle: "Track all vehicle data and inventory",
      addBtn: "Add Vehicle",
      records: "Tracker Records",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      deleteAll: "Delete All",
      deleteSelected: "Delete Selected",
      noRecords: "No vehicles tracked yet",
      uploadCSV: "Upload CSV/XLSX",
      downloadTemplate: "Download Template",
      uploading: "Uploading...",
      uploadSuccess: "File uploaded successfully!",
      deleteSuccess: "Record deleted successfully!",
      deleteAllSuccess: "All records deleted successfully!",
      deleteSelectedSuccess: "Selected records deleted successfully!",
      deleteError: "Error deleting records",
      selectAll: "Select all on this page",
      filterByDate: "Filter by Date",
      allYears: "All Years",
      allMonths: "All Months",
      clearFilter: "Clear Filter",
      totals: "Totals",
    },
    fr: {
      title: "Suivi",
      subtitle: "Suivre toutes les données de véhicules et l'inventaire",
      addBtn: "Ajouter un véhicule",
      records: "Enregistrements de suivi",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      deleteAll: "Supprimer Tout",
      deleteSelected: "Supprimer la sélection",
      noRecords: "Aucun véhicule suivi pour le moment",
      uploadCSV: "Télécharger CSV/XLSX",
      downloadTemplate: "Télécharger le modèle",
      uploading: "Téléchargement en cours...",
      uploadSuccess: "Fichier téléchargé avec succès!",
      deleteSuccess: "Enregistrement supprimé avec succès!",
      deleteAllSuccess: "Tous les enregistrements supprimés avec succès!",
      deleteSelectedSuccess: "Enregistrements sélectionnés supprimés avec succès!",
      deleteError: "Erreur lors de la suppression des enregistrements",
      selectAll: "Sélectionner tous sur cette page",
      filterByDate: "Filtrer par date",
      allYears: "Toutes les années",
      allMonths: "Tous les mois",
      clearFilter: "Effacer le filtre",
      totals: "Totaux",
    },
  }

  const t = labels[language as keyof typeof labels]

  const filteredTracker = tracker.filter((entry: any) => {
    if (!entry.datePurchase) return false
    const entryDate = new Date(entry.datePurchase)
    const year = entryDate.getFullYear().toString()
    const month = String(entryDate.getMonth() + 1).padStart(2, "0")
    const date = entry.datePurchase

    if (dateFilter.year && year !== dateFilter.year) return false
    if (dateFilter.month && month !== dateFilter.month) return false
    if (dateFilter.date && date !== dateFilter.date) return false

    return true
  })

  const calculateTotals = () => {
    const totals: Record<string, number> = {}
    TOTALS_COLUMNS.forEach((col) => {
      totals[col] = filteredTracker.reduce((sum: number, entry: any) => {
        const val = Number.parseFloat(entry[col]) || 0
        return sum + val
      }, 0)
    })
    return totals
  }

  const downloadTemplate = () => {
    const headers = Object.keys(COLUMN_LABELS)
    const csv = headers.join(",")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tracker-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (file: File) => {
    try {
      setShowProgress(true)
      setUploadProgress(0)
      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 201 || xhr.status === 200) {
          setShowProgress(false)
          setToastMessage(t.uploadSuccess)
          setToastType("success")
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          mutate()
        }
      })

      xhr.addEventListener("error", () => {
        setShowProgress(false)
        setToastMessage("Error uploading file")
        setToastType("error")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      })

      xhr.open("POST", "/api/import-tracker")
      xhr.send(formDataToSend)
    } catch (error) {
      console.error("Error uploading file:", error)
      setShowProgress(false)
      setToastMessage("Error uploading file")
      setToastType("error")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getValidationOptions = (field: string) => {
    const options = Array.from(new Set(validations.map((v: any) => v[field]).filter(Boolean)))
    console.log("[v0] getValidationOptions for field:", field, "returned:", options)
    return options
  }

  const handleAddTracker = async () => {
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/tracker/${editingId}` : "/api/tracker"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      setToastMessage(editingId ? "Changes saved successfully!" : "Vehicle added successfully!")
      setToastType("success")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      mutate()
      setFormData({ sellStatus: false, paid: 0, reserve: false })
      setShowDialog(false)
      setEditingId(null)
    } catch (error) {
      console.error("Error saving tracker entry:", error)
      setToastMessage("Error saving changes")
      setToastType("error")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await fetch(`/api/tracker/${id}`, { method: "DELETE" })
        mutate()
        setToastMessage(t.deleteSuccess)
        setToastType("success")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } catch (error) {
        console.error("Error deleting tracker entry:", error)
        setToastMessage(t.deleteError)
        setToastType("error")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL tracker entries? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/tracker/delete-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete entries")
      }

      mutate()
      setSelectedRows(new Set())
      setSelectAll(false)
      setToastMessage(t.deleteAllSuccess)
      setToastType("success")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error: any) {
      console.error("Error deleting all entries:", error)
      setToastMessage(t.deleteError)
      setToastType("error")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
    setSelectAll(newSelected.size === paginatedTracker.length && paginatedTracker.length > 0)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set<string>())
      setSelectAll(false)
    } else {
      const allIds = new Set<string>(paginatedTracker.map((entry: any) => entry.id as string))
      setSelectedRows(allIds)
      setSelectAll(true)
    }
  }

  const startEdit = (entry: any) => {
    setEditingId(entry.id)
    setFormData(entry)
    setShowDialog(true)
  }

  const resetForm = () => {
    setFormData({ sellStatus: false, paid: 0, reserve: false })
    setEditingId(null)
    setShowDialog(false)
  }

  const totalPages = Math.ceil(filteredTracker.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const paginatedTracker = filteredTracker.slice(startIdx, endIdx)
  const totals = calculateTotals()

  const uniqueYears = Array.from(
    new Set(
      tracker.filter((e: any) => e.datePurchase).map((e: any) => new Date(e.datePurchase).getFullYear().toString()),
    ),
  ).sort()

  const uniqueMonths = dateFilter.year
    ? Array.from(
        new Set(
          tracker
            .filter((e: any) => {
              if (!e.datePurchase) return false
              return new Date(e.datePurchase).getFullYear().toString() === dateFilter.year
            })
            .map((e: any) => String(new Date(e.datePurchase).getMonth() + 1).padStart(2, "0")),
        ),
      ).sort()
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-lg">
        <div className="px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t.title}
            </h2>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tracker.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                variant="destructive"
                className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                {t.deleteAll}
              </Button>
            )}
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all text-sm"
            >
              <Download size={18} className="opacity-80" />
              {t.downloadTemplate}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all text-sm"
            >
              <Download size={18} />
              {t.uploadCSV}
            </Button>

            <Button
              onClick={() => {
                resetForm()
                setShowDialog(true)
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all text-sm"
            >
              <Plus size={18} />
              {t.addBtn}
            </Button>
          </div>
        </div>

        {showProgress && (
          <div className="px-4 md:px-8 pb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 tracking-wide">
              {Math.round(uploadProgress)}% {t.uploading}
            </p>
          </div>
        )}
      </header>

      <div className="p-4 md:p-8">
        <Card className="bg-card/50 backdrop-blur border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              {t.filterByDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={dateFilter.year || "all"}
                  onValueChange={(val) => {
                    setDateFilter({ ...dateFilter, year: val || undefined, month: undefined, date: undefined })
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t.allYears} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allYears}</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {dateFilter.year && (
                <div>
                  <label className="text-sm font-medium">Month</label>
                  <Select
                    value={dateFilter.month || "all"}
                    onValueChange={(val) => {
                      setDateFilter({ ...dateFilter, month: val || undefined, date: undefined })
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t.allMonths} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allMonths}</SelectItem>
                      {uniqueMonths.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {dateFilter.year && dateFilter.month && (
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={dateFilter.date || ""}
                    onChange={(e) => {
                      setDateFilter({ ...dateFilter, date: e.target.value || undefined })
                      setCurrentPage(1)
                    }}
                    className="w-32"
                  />
                </div>
              )}

              {(dateFilter.year || dateFilter.month) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFilter({})
                    setCurrentPage(1)
                  }}
                >
                  {t.clearFilter}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>{t.records}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : tracker.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.noRecords}</p>
            ) : (
              <div>
                {selectedRows.size > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-between">
                    <p className="text-sm font-medium">{selectedRows.size} row(s) selected</p>
                  </div>
                )}

                <div className="w-full overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-20">
                      <TableRow className="bg-yellow-50 dark:bg-yellow-950 border-b-2">
                        <TableHead className="w-12 py-2 px-3 font-bold text-yellow-900 dark:text-yellow-100">
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
                        <TableHead className="w-12 py-2 px-3">
                          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label={t.selectAll} />
                        </TableHead>
                        {COLUMNS.map((col) => (
                          <TableHead key={col} className="whitespace-nowrap py-2 px-3">
                            {COLUMN_LABELS[col as keyof typeof COLUMN_LABELS]}
                          </TableHead>
                        ))}
                        <TableHead className="py-2 px-3">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTracker.map((entry: any) => (
                        <TableRow
                          key={entry.id}
                          className={selectedRows.has(entry.id) ? "bg-blue-50 dark:bg-blue-950" : ""}
                        >
                          <TableCell className="w-12 py-2 px-3">
                            <Checkbox
                              checked={selectedRows.has(entry.id)}
                              onCheckedChange={() => handleSelectRow(entry.id)}
                            />
                          </TableCell>
                          {COLUMNS.map((col) => (
                            <TableCell key={`${entry.id}-${col}`} className="whitespace-nowrap text-xs py-2 px-3">
                              {col === "sellStatus" || col === "reserve" ? (
                                <Checkbox checked={entry[col] === true} disabled />
                              ) : col === "totalProfit" || col === "commission" || col === "netProfit" ? (
                                entry[col] !== null && entry[col] !== undefined ? (
                                  `$${Number(entry[col]).toFixed(2)}`
                                ) : (
                                  "-"
                                )
                              ) : typeof entry[col] === "number" ? (
                                `${entry[col]}`
                              ) : entry[col] ? (
                                String(entry[col])
                              ) : (
                                ""
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="flex gap-2 whitespace-nowrap sticky right-0 bg-card py-2 px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(entry)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 h-8 px-2"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-8 px-2"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIdx + 1}-{Math.min(endIdx, filteredTracker.length)} of {filteredTracker.length}{" "}
                      records
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
                          if (i + 1 > totalPages) return null
                          return (
                            <Button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8"
                            >
                              {i + 1}
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date Purchase</label>
              <Input
                type="date"
                value={formData.datePurchase || ""}
                onChange={(e) => setFormData({ ...formData, datePurchase: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Input
                type="text"
                placeholder="Enter action"
                value={formData.action || ""}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Stock No. (NIV)</label>
              <Input
                value={formData.stockNo || ""}
                onChange={(e) => setFormData({ ...formData, stockNo: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category || "default"}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getValidationOptions("category").map((opt: any) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                value={formData.year || ""}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Make/Brand</label>
              <Select value={formData.make || ""} onValueChange={(val) => setFormData({ ...formData, make: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {getValidationOptions("brand").map((opt: any) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <Select value={formData.model || ""} onValueChange={(val) => setFormData({ ...formData, model: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    let models: string[] = []
                    if (formData.make) {
                      models = Array.from(
                        new Set(
                          validations
                            .filter((v: any) => v.brand === formData.make || v.make === formData.make)
                            .map((v: any) => v.model)
                            .filter(Boolean),
                        ),
                      )
                    } else {
                      models = Array.from(new Set(validations.map((v: any) => v.model).filter(Boolean)))
                    }
                    return models.length > 0 ? (
                      models.map((model: string) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-models" disabled>
                        No models available
                      </SelectItem>
                    )
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Mileage (km)</label>
              <Input
                type="number"
                value={formData.mileage || ""}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Select value={formData.color || ""} onValueChange={(val) => setFormData({ ...formData, color: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent>
                  {validations
                    .filter((v: any) => v.brand === formData.make && v.model === formData.model)
                    .map((v: any) => (
                      <SelectItem key={v._id} value={v.color || ""}>
                        {v.color}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice || ""}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reconciliation</label>
              <Input
                type="number"
                step="0.01"
                value={formData.reconciliation || ""}
                onChange={(e) => setFormData({ ...formData, reconciliation: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Esthétique</label>
              <Input
                type="number"
                step="0.01"
                value={formData.esthetique || ""}
                onChange={(e) => setFormData({ ...formData, esthetique: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Transport</label>
              <Input
                type="number"
                step="0.01"
                value={formData.transport || ""}
                onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adjustment</label>
              <Input
                type="number"
                step="0.01"
                value={formData.adjustment || ""}
                onChange={(e) => setFormData({ ...formData, adjustment: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cost Total</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costTotal || ""}
                onChange={(e) => setFormData({ ...formData, costTotal: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Access Credit</label>
              <Input
                type="number"
                step="0.01"
                value={formData.accessCredit || ""}
                onChange={(e) => setFormData({ ...formData, accessCredit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Black Book</label>
              <Input
                type="number"
                step="0.01"
                value={formData.blackBook || ""}
                onChange={(e) => setFormData({ ...formData, blackBook: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Displayed Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.displayedPrice || ""}
                onChange={(e) => setFormData({ ...formData, displayedPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Potential Profit</label>
              <Input
                type="number"
                step="0.01"
                value={formData.potentialProfit || ""}
                onChange={(e) => setFormData({ ...formData, potentialProfit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Checkbox
                  checked={formData.reserve || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, reserve: checked })}
                />
                Reserve
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                value={formData.customerName || ""}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sale Date</label>
              <Input
                type="date"
                value={formData.saleDate || ""}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Paid</label>
              <Input
                type="number"
                value={formData.paid || ""}
                onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Arbitration</label>
              <Input
                value={formData.arbitration || ""}
                onChange={(e) => setFormData({ ...formData, arbitration: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Variable Gross Profit</label>
              <Input
                type="number"
                step="0.01"
                value={formData.variableGrossProfit || ""}
                onChange={(e) => setFormData({ ...formData, variableGrossProfit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cost GP</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costGP || ""}
                onChange={(e) => setFormData({ ...formData, costGP: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">PR GP</label>
              <Input
                type="number"
                step="0.01"
                value={formData.prGP || ""}
                onChange={(e) => setFormData({ ...formData, prGP: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rebate</label>
              <Input
                type="number"
                step="0.01"
                value={formData.rebate || ""}
                onChange={(e) => setFormData({ ...formData, rebate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">V ASS Cost</label>
              <Input
                type="number"
                step="0.01"
                value={formData.vassCost || ""}
                onChange={(e) => setFormData({ ...formData, vassCost: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cost</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost || ""}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">COST PR ASS</label>
              <Input
                type="number"
                step="0.01"
                value={formData.prAss || ""}
                onChange={(e) => setFormData({ ...formData, prAss: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Miscellaneous Expenses</label>
              <Input
                type="number"
                step="0.01"
                value={formData.miscellaneousExpenses || ""}
                onChange={(e) => setFormData({ ...formData, miscellaneousExpenses: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Total Profit</label>
              <Input
                type="number"
                step="0.01"
                value={formData.totalProfit || ""}
                onChange={(e) => setFormData({ ...formData, totalProfit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Commission</label>
              <Input
                type="number"
                step="0.01"
                value={formData.commission || ""}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Net Profit</label>
              <Input
                type="number"
                step="0.01"
                value={formData.netProfit || ""}
                onChange={(e) => setFormData({ ...formData, netProfit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Salesperson</label>
              <Input
                value={formData.salesperson || ""}
                onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Checkbox
                  checked={formData.sellStatus || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, sellStatus: checked })}
                />
                Sold
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={resetForm}>
              {t.cancel}
            </Button>
            <Button onClick={handleAddTracker} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {t.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showToast && <Toast message={toastMessage} type={toastType} />}
    </div>
  )
}
