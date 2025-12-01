"use client"

import { useState, useRef } from "react"
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/hooks/use-language"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const COLUMNS = [
  "datePurchase", "action", "stockNo", "category", "year", "make", "model", "mileage", "color",
  "purchasePrice", "reconciliation", "esthetique", "transport", "adjustment", "costTotal",
  "accessCredit", "blackBook", "displayedPrice", "potentialProfit", "sellStatus", "reserve",
  "customerName", "saleDate", "paid", "arbitration", "variableGrossProfit", "costGP", "prGP",
  "rebate", "vassCost", "cost", "prAss", "miscellaneousExpenses", "totalProfit", "commission",
  "netProfit", "salesperson", "notes"
]

const COLUMN_LABELS: Record<string, string> = {
  datePurchase: "DATE ACHAT", action: "ACTION", stockNo: "# STOCK (NIV)", category: "Catégories",
  year: "ANNÉE", make: "MARQUE", model: "MODÈLE", mileage: "KILOMÉTRAGE", color: "COULEUR",
  purchasePrice: "PRIX ACHAT", reconciliation: "RECON", esthetique: "ESTHÉTIQUE",
  transport: "TRANSPORT", adjustment: "AJUSTEMENT", costTotal: "COUTANT TOTAL",
  accessCredit: "ACCES CRÉDIT", blackBook: "Black Book", displayedPrice: "PRIX AFFICHÉ",
  potentialProfit: "PROFIT POTENTIEL", sellStatus: "Sell Status", reserve: "Reserve",
  customerName: "Nom du client", saleDate: "Date de vente", paid: "PAYÉ", arbitration: "ARBIT.",
  variableGrossProfit: "Bénéfice brut variable", costGP: "COST GP", prGP: "PR GP",
  rebate: "RISTOURNE", vassCost: "V ASS", cost: "Cost", prAss: "COST PR ASS",
  miscellaneousExpenses: "FRAIS DIVERS", totalProfit: "PROFIT TOTAL", commission: "Commission",
  netProfit: "PROFIT NET", salesperson: "Vendeur", notes: "Notes"
}

const TOTALS_COLUMNS = [
  "purchasePrice", "costTotal", "accessCredit", "reconciliation", "esthetique",
  "transport", "adjustment", "displayedPrice", "potentialProfit"
]

const LABELS = {
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
    filterByDate: "Filter by date",
    allYears: "All Years",
    allMonths: "All Months",
    clearFilter: "Clear Filter",
    totals: "Totals"
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
    allMonths: "Toutes les mois",
    clearFilter: "Effacer le filtre",
    totaux: "Totaux"
  }
}

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
  const { data: salesmen = [] } = useSWR("/api/salesmen", fetcher)

  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: "success" | "error"
  }>({ show: false, message: "", type: "success" })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dateFilter, setDateFilter] = useState<{ year?: string; month?: string; date?: string }>({})
  const [formData, setFormData] = useState<Record<string, any>>({
    sellStatus: false,
    paid: "",
    reserve: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsPerPage = 10
  const t = LABELS[language as keyof typeof LABELS]

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  const calculateAutoFields = (data: Record<string, any>) => {
    const num = (val: any) => parseFloat(val) || 0

    const potentialProfit = num(data.potentialProfit)
    const prGP = num(data.prGP)
    const rebate = num(data.rebate)
    const miscellaneousExpenses = num(data.miscellaneousExpenses)
    const vassCost = num(data.vassCost)
    const cost = num(data.cost)

    const prAss = vassCost - cost
    const totalProfit = potentialProfit + prGP + rebate + prAss - miscellaneousExpenses
    const salesman = salesmen.find((s: any) => s.name === data.salesperson)
    const commission = totalProfit * (salesman ? salesman.commissionRate / 100 : 0)
    const netProfit = totalProfit - commission

    return { prAss, totalProfit, commission, netProfit }
  }

  const filteredTracker = tracker.filter((entry: any) => {
    if (!entry.datePurchase) return false

    const entryDate = new Date(entry.datePurchase)
    const year = entryDate.getFullYear().toString()
    const month = String(entryDate.getMonth() + 1).padStart(2, "0")

    if (dateFilter.year && year !== dateFilter.year) return false
    if (dateFilter.month && month !== dateFilter.month) return false
    if (dateFilter.date && entry.datePurchase !== dateFilter.date) return false

    return true
  })

  const calculateTotals = () => {
    const totals: Record<string, number> = {}

    TOTALS_COLUMNS.forEach(col => {
      totals[col] = filteredTracker.reduce(
        (sum: number, entry: any) => sum + (parseFloat(entry[col]) || 0),
        0
      )
    })

    return totals
  }

  const downloadTemplate = () => {
    const csv = Object.keys(COLUMN_LABELS).join(",")
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

      xhr.upload.addEventListener("progress", e => {
        if (e.lengthComputable) setUploadProgress((e.loaded / e.total) * 100)
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 201 || xhr.status === 200) {
          setShowProgress(false)
          showToast(t.uploadSuccess)
          mutate()
        } else {
          setShowProgress(false)
          showToast("Error uploading file", "error")
        }
      })

      xhr.addEventListener("error", () => {
        setShowProgress(false)
        showToast("Error uploading file", "error")
      })

      xhr.open("POST", "/api/import-tracker")
      xhr.send(formDataToSend)
    } catch (error) {
      console.error("Error uploading file:", error)
      setShowProgress(false)
      showToast("Error uploading file", "error")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const getValidationOptions = (field: string) =>
    Array.from(new Set(validations.map((v: any) => v[field]).filter(Boolean)))

  const handleAddTracker = async () => {
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/tracker/${editingId}` : "/api/tracker"

      const autoCalcs = calculateAutoFields(formData)
      const dataToSend = { ...formData }

      // Parse numeric values
      dataToSend.year = formData.year ? parseInt(formData.year) : undefined
      dataToSend.mileage = formData.mileage ? parseFloat(formData.mileage) : undefined
      dataToSend.purchasePrice = formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined
      dataToSend.reconciliation = formData.reconciliation ? parseFloat(formData.reconciliation) : undefined
      dataToSend.esthetique = formData.esthetique ? parseFloat(formData.esthetique) : undefined
      dataToSend.transport = formData.transport ? parseFloat(formData.transport) : undefined
      dataToSend.adjustment = formData.adjustment ? parseFloat(formData.adjustment) : undefined
      dataToSend.costTotal = formData.costTotal ? parseFloat(formData.costTotal) : undefined
      dataToSend.accessCredit = formData.accessCredit ? parseFloat(formData.accessCredit) : undefined
      dataToSend.blackBook = formData.blackBook ? parseFloat(formData.blackBook) : undefined
      dataToSend.displayedPrice = formData.displayedPrice ? parseFloat(formData.displayedPrice) : undefined
      dataToSend.potentialProfit = formData.potentialProfit ? parseFloat(formData.potentialProfit) : undefined
      dataToSend.variableGrossProfit = formData.variableGrossProfit ? parseFloat(formData.variableGrossProfit) : undefined
      dataToSend.costGP = formData.costGP ? parseFloat(formData.costGP) : undefined
      dataToSend.prGP = formData.prGP ? parseFloat(formData.prGP) : undefined
      dataToSend.rebate = formData.rebate ? parseFloat(formData.rebate) : undefined
      dataToSend.vassCost = formData.vassCost ? parseFloat(formData.vassCost) : undefined
      dataToSend.cost = formData.cost ? parseFloat(formData.cost) : undefined
      dataToSend.miscellaneousExpenses = formData.miscellaneousExpenses ? parseFloat(formData.miscellaneousExpenses) : undefined

      // Auto-generated fields
      dataToSend.prAss = autoCalcs.prAss
      dataToSend.totalProfit = autoCalcs.totalProfit
      dataToSend.commission = autoCalcs.commission
      dataToSend.netProfit = autoCalcs.netProfit

      // Boolean values
      dataToSend.sellStatus = !!formData.sellStatus
      dataToSend.reserve = !!formData.reserve

      console.log("Sending data:", dataToSend)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save")
      }

      const result = await response.json()
      console.log("Server response:", result)

      showToast(editingId ? "Changes saved successfully!" : "Vehicle added successfully!")
      mutate()
      resetForm()
    } catch (error: any) {
      console.error("Error saving tracker entry:", error)
      showToast(error.message || "Error saving changes", "error")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return

    try {
      await fetch(`/api/tracker/${id}`, { method: "DELETE" })
      mutate()
      showToast(t.deleteSuccess)
    } catch (error) {
      console.error("Error deleting tracker entry:", error)
      showToast(t.deleteError, "error")
    }
  }

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL tracker entries? This action cannot be undone."
      )
    )
      return

    setIsDeleting(true)

    try {
      const response = await fetch("/api/tracker", { method: "DELETE" })
      if (!response.ok) throw new Error((await response.json()).error || "Failed to delete entries")

      mutate()
      setSelectedRows(new Set())
      setSelectAll(false)
      showToast(t.deleteAllSuccess)
    } catch (error) {
      console.error("Error deleting all entries:", error)
      showToast(t.deleteError, "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows)

    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id)

    setSelectedRows(newSelected)
    setSelectAll(newSelected.size === paginatedTracker.length && paginatedTracker.length > 0)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set())
      setSelectAll(false)
    } else {
      setSelectedRows(new Set(paginatedTracker.map((entry: any) => entry.id)))
      setSelectAll(true)
    }
  }

  const startEdit = (entry: any) => {
    setEditingId(entry.id)

    const editData = {
      ...entry,
      sellStatus: !!entry.sellStatus,
      reserve: !!entry.reserve,
      paid: entry.paid?.toString() || ""
    }

    setFormData(editData)
    setShowDialog(true)
  }

  const resetForm = () => {
    setFormData({ sellStatus: false, paid: "", reserve: false })
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
      tracker
        .filter((e: any) => e.datePurchase)
        .map((e: any) => new Date(e.datePurchase).getFullYear().toString())
    )
  ).sort()

  const uniqueMonths = dateFilter.year
    ? Array.from(
        new Set(
          tracker
            .filter(
              (e: any) =>
                e.datePurchase &&
                new Date(e.datePurchase).getFullYear().toString() === dateFilter.year
            )
            .map((e: any) =>
              String(new Date(e.datePurchase).getMonth() + 1).padStart(2, "0")
            )
        )
      ).sort()
    : []

  const formatCurrency = (val: any) =>
    val !== null && val !== undefined
      ? `$${Number(val).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`
      : "-"

  const renderCellValue = (entry: any, col: string) => {
    if (col === "sellStatus" || col === "reserve")
      return <Checkbox checked={entry[col] === true} disabled />

    if (["totalProfit", "commission", "netProfit"].includes(col))
      return entry[col] !== null && entry[col] !== undefined
        ? `$${Number(entry[col]).toFixed(2)}`
        : "-"

    if (
      [
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
        "variableGrossProfit",
        "costGP",
        "prGP",
        "rebate",
        "vassCost",
        "cost",
        "prAss",
        "miscellaneousExpenses"
      ].includes(col)
    ) {
      return formatCurrency(entry[col])
    }

    if (col === "mileage") return entry[col] ? `${entry[col]}km` : ""

    return typeof entry[col] === "number" ? `${entry[col]}` : entry[col] || ""
  }
const formatNumberWithCommas = (value: string | number): string => {
  if (!value) return ""
  const num = typeof value === "string" ? value.replace(/,/g, "") : value.toString()
  if (isNaN(Number(num))) return value.toString()
  return Number(num).toLocaleString("en-US", { maximumFractionDigits: 2 })
}

const parseNumberValue = (value: string): string => {
  return value.replace(/,/g, "")
}
return (
<div className="min-h-screen bg-background">
<header className="sticky top-0 z-20 border-b border-border/40 bg-card/70 backdrop-blur-xl">
<div className="px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div className="space-y-2">
<h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
{t.title}
</h2>
<p className="text-muted-foreground text-sm">{t.subtitle}</p>
</div>
<div className="flex flex-wrap gap-2 w-full md:w-auto">
        {tracker.length > 0 && (
          <Button onClick={handleDeleteAll} disabled={isDeleting} variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm">
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            {t.deleteAll}
          </Button>
        )}
        <Button onClick={downloadTemplate} variant="outline" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-sm">
          <Download size={18} />
          {t.downloadTemplate}
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-sm">
          <Download size={18} />
          {t.uploadCSV}
        </Button>
        <Button onClick={() => { resetForm(); setShowDialog(true) }} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-sm">
          <Plus size={18} />
          {t.addBtn}
        </Button>
      </div>
    </div>

    {showProgress && (
      <div className="px-4 md:px-8 pb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{Math.round(uploadProgress)}% {t.uploading}</p>
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
            <Select value={dateFilter.year || "all"} onValueChange={(val) => {
              setDateFilter({ year: val === "all" ? undefined : val })
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-32"><SelectValue placeholder={t.allYears} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allYears}</SelectItem>
{uniqueYears.map((year) => (
  <SelectItem key={String(year)} value={String(year)}>
    {String(year)}
  </SelectItem>
))}
              </SelectContent>
            </Select>
          </div>

          {dateFilter.year && (
            <div>
              <label className="text-sm font-medium">Month</label>
              <Select value={dateFilter.month || "all"} onValueChange={(val) => {
                setDateFilter({ ...dateFilter, month: val === "all" ? undefined : val, date: undefined })
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-32"><SelectValue placeholder={t.allMonths} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allMonths}</SelectItem>
{uniqueMonths.map((month) => (
  <SelectItem key={String(month)} value={String(month)}>
    {String(month)}
  </SelectItem>
))}
                </SelectContent>
              </Select>
            </div>
          )}

          {dateFilter.year && dateFilter.month && (
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={dateFilter.date || ""} onChange={(e) => {
                setDateFilter({ ...dateFilter, date: e.target.value || undefined })
                setCurrentPage(1)
              }} className="w-32" />
            </div>
          )}

          {(dateFilter.year || dateFilter.month || dateFilter.date) && (
            <Button variant="outline" onClick={() => { setDateFilter({}); setCurrentPage(1) }}>{t.clearFilter}</Button>
          )}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader><CardTitle>{t.records}</CardTitle></CardHeader>
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
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium">{selectedRows.size} row(s) selected</p>
              </div>
            )}

            <div className="w-full overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-20">
                  <TableRow className="bg-yellow-50 dark:bg-yellow-950 border-b-2">
                    <TableHead className="w-12 py-2 px-3 font-bold text-yellow-900 dark:text-yellow-100">{(t as any).totals}
</TableHead>
                    {COLUMNS.map(col => (
                      <TableHead key={`total-${col}`} className="whitespace-nowrap py-2 px-3 text-yellow-900 dark:text-yellow-100 font-bold">
                        {TOTALS_COLUMNS.includes(col) ? formatCurrency(totals[col]) : ""}
                      </TableHead>
                    ))}
                    <TableHead className="py-2 px-3"></TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="w-12 py-2 px-3">
                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label={t.selectAll} />
                    </TableHead>
                    {COLUMNS.map(col => (
                      <TableHead key={col} className="whitespace-nowrap py-2 px-3">{COLUMN_LABELS[col]}</TableHead>
                    ))}
                    <TableHead className="py-2 px-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTracker.map((entry: any) => (
                    <TableRow key={entry.id} className={selectedRows.has(entry.id) ? "bg-blue-50 dark:bg-blue-950" : ""}>
                      <TableCell className="w-12 py-2 px-3">
                        <Checkbox checked={selectedRows.has(entry.id)} onCheckedChange={() => handleSelectRow(entry.id)} />
                      </TableCell>
                      {COLUMNS.map(col => (
                        <TableCell key={`${entry.id}-${col}`} className="whitespace-nowrap text-xs py-2 px-3">
                          {renderCellValue(entry, col)}
                        </TableCell>
                      ))}
                      <TableCell className="flex gap-2 whitespace-nowrap sticky right-0 bg-card py-2 px-3">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(entry)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 h-8 px-2">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-8 px-2">
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
                  Showing {startIdx + 1}-{Math.min(endIdx, filteredTracker.length)} of {filteredTracker.length} records
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} variant="outline" size="sm" className="gap-2">
                    <ChevronLeft size={16} />Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      let pageNum
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
                        <Button key={pageNum} onClick={() => setCurrentPage(pageNum)} variant={currentPage === pageNum ? "default" : "outline"} size="sm" className="w-8 h-8">
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} variant="outline" size="sm" className="gap-2">
                    Next<ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  </div>

<Dialog open={showDialog} onOpenChange={(isOpen) => { setShowDialog(isOpen); if (!isOpen) resetForm() }}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Date Purchase</label>
        <Input type="date" value={formData.datePurchase || ""} onChange={(e) => setFormData({ ...formData, datePurchase: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Action</label>
        <Input value={formData.action || ""} onChange={(e) => setFormData({ ...formData, action: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Stock No. (NIV)</label>
        <Input value={formData.stockNo || ""} onChange={(e) => setFormData({ ...formData, stockNo: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Category</label>
        <Select value={formData.category || ""} onValueChange={(val) => setFormData({ ...formData, category: val })}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {getValidationOptions("category").map((opt: any) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Year</label>
        <Select value={formData.year?.toString() || ""} onValueChange={(val) => setFormData({ ...formData, year: val })}>
          <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year =>
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Make/Brand</label>
        <Select value={formData.make || ""} onValueChange={(val) => setFormData({ ...formData, make: val, model: "", color: "" })}>
          <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
          <SelectContent>
            {getValidationOptions("brand").map((opt: any) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Model</label>
        <Select value={formData.model || ""} onValueChange={(val) => setFormData({ ...formData, model: val })}>
          <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
          <SelectContent>
            {getValidationOptions("model").map((opt: any) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      {/* Mileage with km suffix */}
      <div>
        <label className="text-sm font-medium">Mileage</label>
        <div className="relative">
          <Input 
            type="text" 
            value={formData.mileage ? formatNumberWithCommas(formData.mileage) : ""} 
            onChange={(e) => {
              const cleaned = parseNumberValue(e.target.value)
              setFormData({ ...formData, mileage: cleaned })
            }}
            className="pr-12"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            km
          </span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Color</label>
        <Select value={formData.color || ""} onValueChange={(val) => setFormData({ ...formData, color: val })}>
          <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
          <SelectContent>
            {getValidationOptions("color").map((opt: any) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* All money fields with comma formatting */}
      {["purchasePrice", "reconciliation", "esthetique", "transport", "adjustment", "accessCredit", "blackBook", 
        "displayedPrice", "variableGrossProfit", "costGP", "prGP", "rebate", "vassCost", "cost"].map(field => (
        <div key={field}>
          <label className="text-sm font-medium">{COLUMN_LABELS[field]}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              $
            </span>
            <Input 
              type="text"
              value={formData[field] ? formatNumberWithCommas(formData[field]) : ""}
              onChange={(e) => {
                const cleaned = parseNumberValue(e.target.value)
                setFormData({ ...formData, [field]: cleaned })
              }}
              className="pl-7"
              placeholder="0.00"
            />
          </div>
        </div>
      ))}

      <div className="col-span-1 sm:col-span-2 p-4 bg-muted/50 rounded-lg border">
        <h3 className="font-semibold text-sm mb-4">Auto-Calculated Fields (Read-Only)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(() => {
            const auto = calculateAutoFields(formData)
            return (
              <>
                {["prAss", "totalProfit", "commission", "netProfit"].map(field => (
                  <div key={field}>
                    <label className="text-sm font-medium text-muted-foreground">{COLUMN_LABELS[field]}</label>
                    <div className="text-lg font-semibold">${auto[field as keyof typeof auto].toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                  </div>
                ))}
              </>
            )
          })()}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Customer Name</label>
        <Input value={formData.customerName || ""} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Sale Date</label>
        <Input type="date" value={formData.saleDate || ""} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Paid</label>
        <Input value={formData.paid || ""} onChange={(e) => setFormData({ ...formData, paid: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Arbitration</label>
        <Input value={formData.arbitration || ""} onChange={(e) => setFormData({ ...formData, arbitration: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium">Miscellaneous Expenses (Frais Divers)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            $
          </span>
          <Input 
            type="text"
            value={formData.miscellaneousExpenses ? formatNumberWithCommas(formData.miscellaneousExpenses) : ""}
            onChange={(e) => {
              const cleaned = parseNumberValue(e.target.value)
              setFormData({ ...formData, miscellaneousExpenses: cleaned })
            }}
            className="pl-7"
            placeholder="0.00"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Salesperson</label>
        <Select value={formData.salesperson || ""} onValueChange={(val) => setFormData({ ...formData, salesperson: val })}>
          <SelectTrigger><SelectValue placeholder="Select salesperson" /></SelectTrigger>
          <SelectContent>
            {salesmen.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-1 sm:col-span-2">
        <label className="text-sm font-medium">Notes</label>
        <Input value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Checkbox checked={formData.sellStatus || false} onCheckedChange={(checked) => setFormData({ ...formData, sellStatus: checked })} />
          Sold
        </label>
      </div>
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Checkbox checked={formData.reserve || false} onCheckedChange={(checked) => setFormData({ ...formData, reserve: checked })} />
          Reserve
        </label>
      </div>
    </div>
    <div className="flex gap-2 justify-end pt-4">
      <Button variant="outline" onClick={resetForm}>{t.cancel}</Button>
      <Button onClick={handleAddTracker} className="bg-emerald-600 hover:bg-emerald-700 text-white">{t.save}</Button>
    </div>
  </DialogContent>
</Dialog>

  {toast.show && <Toast message={toast.message} type={toast.type} />}
</div>
)
}