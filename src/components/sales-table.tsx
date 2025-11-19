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

export default function SalesTable({ sales, onRefresh }: any) {
  const { language } = useLanguage()

  const headers = {
    en: {
      stockNo: 'Stock No.',
      brand: 'Brand',
      model: 'Model',
      salePrice: 'Sale Price',
      carProfit: 'Car Profit',
      totalProfit: 'Total Profit',
      salesman: 'Salesman',
      commissionAmount: 'Commission',
      netProfit: 'Net Profit',
      month: 'Month',
      actions: 'Actions',
      noRecords: 'No sales records yet'
    },
    fr: {
      stockNo: 'N° de stock',
      brand: 'Marque',
      model: 'Modèle',
      salePrice: 'Prix de vente',
      carProfit: 'Profit du véhicule',
      totalProfit: 'Profit total',
      salesman: 'Vendeur',
      commissionAmount: 'Commission',
      netProfit: 'Profit net',
      month: 'Mois',
      actions: 'Actions',
      noRecords: 'Aucun enregistrement de vente'
    }
  }

  const t = headers[language as keyof typeof headers]

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sales/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Error deleting sale:', error)
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>{t.stockNo}</TableHead>
            <TableHead>{t.brand}</TableHead>
            <TableHead>{t.model}</TableHead>
            <TableHead>{t.salePrice}</TableHead>
            <TableHead>{t.carProfit}</TableHead>
            <TableHead>{t.totalProfit}</TableHead>
            <TableHead>{t.salesman}</TableHead>
            <TableHead>{t.commissionAmount}</TableHead>
            <TableHead>{t.netProfit}</TableHead>
            <TableHead>{t.month}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                {t.noRecords}
              </TableCell>
            </TableRow>
          ) : (
            sales.map((item: any) => (
              <TableRow key={item._id} className="border-border">
                <TableCell className="font-medium text-sm">{item.stockNo}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell className="text-sm font-semibold">${parseFloat(item.salePrice || 0).toFixed(2)}</TableCell>
                <TableCell className={`text-sm font-semibold ${parseFloat(item.carProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${parseFloat(item.carProfit || 0).toFixed(2)}
                </TableCell>
                <TableCell className={`text-sm font-semibold ${parseFloat(item.totalProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${parseFloat(item.totalProfit || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-sm">{item.salesman}</TableCell>
                <TableCell className="text-sm">${parseFloat(item.commissionAmount || 0).toFixed(2)}</TableCell>
                <TableCell className={`text-sm font-semibold ${parseFloat(item.netProfit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${parseFloat(item.netProfit || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-sm">{item.month}</TableCell>
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
