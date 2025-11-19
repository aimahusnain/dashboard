'use client'

import { useState, useRef } from 'react'
import { Loader2, Plus, Edit2, Trash2, Download,  } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/hooks/use-language'
import Uploadtrackingdata from '@/components/upload-tracking-data'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLUMNS = [
  'datePurchase', 'action', 'stockNo', 'category', 'year', 'make', 'model', 'mileage',
  'color', 'purchasePrice', 'reconciliation', 'ESTHÉTIQUE', 'transport', 'adjustment', 'costTotal',
  'accessCredit', 'displayedPrice', 'potentialProfit', 'sellStatus', 'customerName',
  'saleDate', 'paid', 'arbitration', 'variableGrossProfit', 'costGP', 'prGP','RISTOURNE', 'VASS','COST','PRASS','FRAISDIVERS','PROFITTOTAL','Commission','PROFITNET', 'Vendeur', 'Notes'
]

const COLUMN_LABELS = {
  datePurchase: 'DATE ACHAT',
  action: 'ACTION',
  stockNo: '# STOCK (NIV)',
  category: 'Catégories',
  year: 'ANNÉE',
  make: 'MARQUE',
  model: 'MODÈLE',
  mileage: 'KILOMÉTRAGE',
  color: 'COULEUR',
  purchasePrice: 'PRIX ACHAT',
  reconciliation: 'RECON',
  ESTHÉTIQUE: 'ESTHÉTIQUE',
  transport: 'TRANSPORT',
  adjustment: 'AJUSTEMENT',
  costTotal: 'COUTANT TOTAL',
  accessCredit: 'ACCES CRÉDIT',
  displayedPrice: 'PRIX AFFICHÉ',
  potentialProfit: 'PROFIT POTENTIEL',
  sellStatus: 'Sell Status',
  customerName: 'Nom du client',
  saleDate: 'Date de vente',
  paid: 'PAYÉ',
  arbitration: 'ARBIT.',
  variableGrossProfit: 'Bénéfice brut variable',
  costGP: 'COST GP',
  prGP: 'PR GP',
  RISTOURNE: 'RISTOURNE',
  VASS: 'V ASS',
  COST: 'COST',
  PRASS: 'PR ASS',
  FRAISDIVERS: 'FRAIS DIVERS',
  PROFITTOTAL: 'PROFIT TOTAL',
  Commission: 'Commission',
  PROFITNET: 'PROFIT NET',
  Vendeur: 'Vendeur',
  Notes: 'Notes'
};


function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg animate-in slide-in-from-bottom-5 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {message}
    </div>
  )
}

export default function TrackerPage() {
  const { language } = useLanguage()
  const { data: tracker = [], isLoading, mutate } = useSWR('/api/tracker', fetcher)
  const { data: validations = [] } = useSWR('/api/validations', fetcher)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({
    sellStatus: false,
    paid: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const labels = {
    en: {
      title: 'Tracker',
      subtitle: 'Track all vehicle data and inventory',
      addBtn: 'Add Vehicle',
      records: 'Tracker Records',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      noRecords: 'No vehicles tracked yet',
      uploadCSV: 'Upload CSV/XLSX',
      downloadTemplate: 'Download Template',
      uploading: 'Uploading...',
      uploadSuccess: 'File uploaded successfully!'
    },
    fr: {
      title: 'Suivi',
      subtitle: 'Suivre toutes les données de véhicules et l\'inventaire',
      addBtn: 'Ajouter un véhicule',
      records: 'Enregistrements de suivi',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      noRecords: 'Aucun véhicule suivi pour le moment',
      uploadCSV: 'Télécharger CSV/XLSX',
      downloadTemplate: 'Télécharger le modèle',
      uploading: 'Téléchargement en cours...',
      uploadSuccess: 'Fichier téléchargé avec succès!'
    }
  }

  const t = labels[language as keyof typeof labels]

  const downloadTemplate = () => {
    const headers = Object.keys(COLUMN_LABELS)
    const csv = headers.join(',')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tracker-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (file: File) => {
    try {
      setShowProgress(true)
      setUploadProgress(0)
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 201 || xhr.status === 200) {
          setShowProgress(false)
          setToastMessage(t.uploadSuccess)
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          mutate()
        }
      })

      xhr.addEventListener('error', () => {
        setShowProgress(false)
        setToastMessage('Error uploading file')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      })

      xhr.open('POST', '/api/tracker')
      xhr.send(formDataToSend)
    } catch (error) {
      console.error('Error uploading file:', error)
      setShowProgress(false)
      setToastMessage('Error uploading file')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getValidationOptions = (field: string) => {
    return Array.from(new Set(
      validations
        .map((v: any) => v[field])
        .filter(Boolean)
    ))
  }

  const handleAddTracker = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/tracker/${editingId}` : '/api/tracker'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      setToastMessage(editingId ? 'Changes saved successfully!' : 'Vehicle added successfully!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      
      mutate()
      setFormData({ sellStatus: false, paid: false })
      setShowDialog(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving tracker entry:', error)
      setToastMessage('Error saving changes')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tracker/${id}`, { method: 'DELETE' })
      mutate()
      setToastMessage('Record deleted successfully!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error('Error deleting tracker entry:', error)
    }
  }

  const startEdit = (entry: any) => {
    setEditingId(entry.id)
    setFormData(entry)
    setShowDialog(true)
  }

  const resetForm = () => {
    setFormData({ sellStatus: false, paid: false })
    setEditingId(null)
    setShowDialog(false)
  }

  return (
    <div className="min-h-screen bg-background">
   <header className="sticky top-0 z-20 border-b border-border/40 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-lg">
  <div className="px-8 py-6 flex justify-between items-center">
    <div className="space-y-2">
      <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
        {t.title}
      </h2>
      <p className="text-muted-foreground text-sm">{t.subtitle}</p>
    </div>

    <div className="flex gap-3 items-center">

      {/* Download Template */}
      <Button
        onClick={downloadTemplate}
        variant="outline"
        className="gap-2 bg-emerald-600 mt-2 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all"
      >
        <Download size={18} className="opacity-80" />
        {t.downloadTemplate}
      </Button>

      {/* Upload CSV */}
 

      <Uploadtrackingdata />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        
        onChange={(e) =>
          e.target.files?.[0] && handleFileUpload(e.target.files[0])
        }
        className="hidden border-none mb-5"
      />

      {/* Add New */}
      <Button
        onClick={() => {
          resetForm()
          setShowDialog(true)
        }}
        className="gap-2 bg-emerald-600 mt-2 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all"
      >
        <Plus size={18} />
        {t.addBtn}
      </Button>
    </div>
  </div>

  {/* Progress Bar */}
  {showProgress && (
    <div className="px-8 pb-4">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2 tracking-wide">
        {Math.round(uploadProgress)}% uploaded
      </p>
    </div>
  )}
</header>


      <div className="p-8">
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
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {COLUMNS.map(col => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {COLUMN_LABELS[col as keyof typeof COLUMN_LABELS]}
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tracker.map((entry: any) => (
                      <TableRow key={entry.id}>
                        {COLUMNS.map(col => (
                          <TableCell key={`${entry.id}-${col}`} className="whitespace-nowrap text-xs">
                            {col === 'sellStatus' || col === 'paid' ? (
                              <Checkbox checked={entry[col]} disabled />
                            ) : (
                              entry[col] ? String(entry[col]) : ''
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="flex gap-2 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(entry)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
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
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date Purchase</label>
              <Input
                type="date"
                value={formData.datePurchase || ''}
                onChange={(e) => setFormData({ ...formData, datePurchase: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={formData.action || ''} onValueChange={(val) => setFormData({ ...formData, action: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {getValidationOptions('action').map((opt: any) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Stock No. (NIV)</label>
              <Input value={formData.stockNo || ''} onChange={(e) => setFormData({ ...formData, stockNo: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category || ''} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getValidationOptions('category').map((opt: any) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input type="number" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Make/Brand</label>
              <Select value={formData.make || ''} onValueChange={(val) => setFormData({ ...formData, make: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {getValidationOptions('brand').map((opt: any) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <Input value={formData.model || ''} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Mileage</label>
              <Input type="number" value={formData.mileage || ''} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input value={formData.color || ''} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Price</label>
              <Input type="number" step="0.01" value={formData.purchasePrice || ''} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Reconciliation</label>
              <Input type="number" step="0.01" value={formData.reconciliation || ''} onChange={(e) => setFormData({ ...formData, reconciliation: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Esthétique</label>
              <Input type="number" step="0.01" value={formData.esthetique || ''} onChange={(e) => setFormData({ ...formData, esthetique: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Transport</label>
              <Input type="number" step="0.01" value={formData.transport || ''} onChange={(e) => setFormData({ ...formData, transport: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Adjustment</label>
              <Input type="number" step="0.01" value={formData.adjustment || ''} onChange={(e) => setFormData({ ...formData, adjustment: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Cost Total</label>
              <Input type="number" step="0.01" value={formData.costTotal || ''} onChange={(e) => setFormData({ ...formData, costTotal: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Access Credit</label>
              <Input type="number" step="0.01" value={formData.accessCredit || ''} onChange={(e) => setFormData({ ...formData, accessCredit: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Displayed Price</label>
              <Input type="number" step="0.01" value={formData.displayedPrice || ''} onChange={(e) => setFormData({ ...formData, displayedPrice: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Potential Profit</label>
              <Input type="number" step="0.01" value={formData.potentialProfit || ''} onChange={(e) => setFormData({ ...formData, potentialProfit: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Customer Name</label>
              <Input value={formData.customerName || ''} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Sale Date</label>
              <Input type="date" value={formData.saleDate || ''} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Arbitration</label>
              <Input value={formData.arbitration || ''} onChange={(e) => setFormData({ ...formData, arbitration: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Variable Gross Profit</label>
              <Input type="number" step="0.01" value={formData.variableGrossProfit || ''} onChange={(e) => setFormData({ ...formData, variableGrossProfit: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Cost GP</label>
              <Input type="number" step="0.01" value={formData.costGP || ''} onChange={(e) => setFormData({ ...formData, costGP: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">PR GP</label>
              <Input type="number" step="0.01" value={formData.prGP || ''} onChange={(e) => setFormData({ ...formData, prGP: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Rebate</label>
              <Input type="number" step="0.01" value={formData.rebate || ''} onChange={(e) => setFormData({ ...formData, rebate: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">V ASS Cost</label>
              <Input type="number" step="0.01" value={formData.vassCost || ''} onChange={(e) => setFormData({ ...formData, vassCost: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">PR ASS</label>
              <Input type="number" step="0.01" value={formData.prAss || ''} onChange={(e) => setFormData({ ...formData, prAss: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Miscellaneous Expenses</label>
              <Input type="number" step="0.01" value={formData.miscellaneousExpenses || ''} onChange={(e) => setFormData({ ...formData, miscellaneousExpenses: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Total Profit</label>
              <Input type="number" step="0.01" value={formData.totalProfit || ''} onChange={(e) => setFormData({ ...formData, totalProfit: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Commission</label>
              <Input type="number" step="0.01" value={formData.commission || ''} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Net Profit</label>
              <Input type="number" step="0.01" value={formData.netProfit || ''} onChange={(e) => setFormData({ ...formData, netProfit: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Salesperson</label>
              <Input value={formData.salesperson || ''} onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Input value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Checkbox
                  checked={formData.sellStatus || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, sellStatus: checked })}
                />
                Sell Status
              </label>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Checkbox
                  checked={formData.paid || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, paid: checked })}
                />
                Paid
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

      {showToast && <Toast message={toastMessage} type="success" />}
    </div>
  )
}
