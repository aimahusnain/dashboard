'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'

const statusColors: Record<string, string> = {
  'Estimation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Financing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Sold': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'Arbitration': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function InventoryTable({ inventory, onRefresh }: any) {
  const { language } = useLanguage()

  const headers = {
    en: {
      stockNo: 'Stock No.',
      vin: 'VIN Number',
      category: 'Category',
      year: 'Year',
      brand: 'Brand',
      model: 'Model',
      km: 'Kilometers',
      color: 'Color',
      status: 'Status',
      purchasePrice: 'Purchase Price',
      totalCost: 'Total Cost',
      bankLimit: 'Bank Limit',
      advertisedPrice: 'Advertised Price',
      potentialProfit: 'Potential Profit',
      actions: 'Actions',
      noRecords: 'No inventory records yet'
    },
    fr: {
      stockNo: 'N° de stock',
      vin: 'Numéro VIN',
      category: 'Catégorie',
      year: 'Année',
      brand: 'Marque',
      model: 'Modèle',
      km: 'Kilomètres',
      color: 'Couleur',
      status: 'Statut',
      purchasePrice: 'Prix d\'achat',
      totalCost: 'Coût total',
      bankLimit: 'Limite bancaire',
      advertisedPrice: 'Prix annoncé',
      potentialProfit: 'Profit potentiel',
      actions: 'Actions',
      noRecords: 'Aucun enregistrement d\'inventaire'
    }
  }

  const t = headers[language as keyof typeof headers]

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Error deleting inventory:', error)
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>{t.stockNo}</TableHead>
            <TableHead>{t.vin}</TableHead>
            <TableHead>{t.brand}</TableHead>
            <TableHead>{t.model}</TableHead>
            <TableHead>{t.year}</TableHead>
            <TableHead>{t.km}</TableHead>
            <TableHead>{t.color}</TableHead>
            <TableHead>{t.status}</TableHead>
            <TableHead>{t.purchasePrice}</TableHead>
            <TableHead>{t.totalCost}</TableHead>
            <TableHead>{t.advertisedPrice}</TableHead>
            <TableHead>{t.potentialProfit}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                {t.noRecords}
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((item: any) => (
              <TableRow key={item._id} className="border-border">
                <TableCell className="font-medium text-sm">{item.stockNo}</TableCell>
                <TableCell className="font-mono text-xs">{item.vinNumber}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell className="text-sm">{item.year}</TableCell>
                <TableCell className="text-sm">{item.kilometers}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.color}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[item.status] || 'bg-gray-100'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">${parseFloat(item.purchasePrice || 0).toFixed(2)}</TableCell>
                <TableCell className="text-sm">${parseFloat(item.totalCost || 0).toFixed(2)}</TableCell>
                <TableCell className="text-sm">${parseFloat(item.advertisedPrice || 0).toFixed(2)}</TableCell>
                <TableCell className={`text-sm font-semibold ${parseFloat(item.potentialProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${parseFloat(item.potentialProfit || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
