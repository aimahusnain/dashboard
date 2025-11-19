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

export default function ValidationTable({ validations, onRefresh }: any) {
  const { language } = useLanguage()

  const headers = {
    en: { brand: 'Brand', category: 'Category', status: 'Status', actions: 'Actions', noRecords: 'No validation records yet' },
    fr: { brand: 'Marque', category: 'Catégorie', status: 'Statut', actions: 'Actions', noRecords: 'Aucun enregistrement de validation' }
  }

  const t = headers[language as keyof typeof headers]

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/validations/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Error deleting validation:', error)
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>{t.brand}</TableHead>
            <TableHead>{t.category}</TableHead>
            <TableHead>{t.status}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                {t.noRecords}
              </TableCell>
            </TableRow>
          ) : (
            validations.map((validation: any) => (
              <TableRow key={validation._id} className="border-border">
                <TableCell className="font-medium">{validation.brand || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{validation.category || '-'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[validation.status] || 'bg-gray-100'}>
                    {validation.status || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(validation._id)}
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
