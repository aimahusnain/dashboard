'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/hooks/use-language'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const sectionColors = [
  { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
  { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
  { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
]

export default function CommissionPage() {
  const { language } = useLanguage()
  const { data: salesmen = [], isLoading: salesmenLoading } = useSWR('/api/salesmen', fetcher)
  const { data: sales = [], isLoading: salesLoading } = useSWR('/api/sales', fetcher)
  const { data: payments = [], isLoading: paymentsLoading, mutate: mutatePayments } = useSWR('/api/payments', fetcher)
  const [isOpen, setIsOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [paymentForm, setPaymentForm] = useState({ salesman: '', paymentDate: '', paymentAmount: '', notes: '' })
  const [editingSalesman, setEditingSalesman] = useState<string | null>(null)

  const labels = {
    en: {
      title: 'Commission',
      subtitle: 'Track salesman payments and commissions',
      addPayment: 'Add Payment',
      sections: 'Payment Sections',
      paymentDate: 'Payment Date',
      amount: 'Payment Amount',
      notes: 'Notes',
      totalPaid: 'Total Paid',
      totalEarned: 'Total Earned',
      balance: 'Balance',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      addSection: 'Add Section',
      noPayments: 'No payments yet',
    },
    fr: {
      title: 'Commission',
      subtitle: 'Suivre les paiements et les commissions des vendeurs',
      addPayment: 'Ajouter un paiement',
      sections: 'Sections de paiement',
      paymentDate: 'Date de paiement',
      amount: 'Montant du paiement',
      notes: 'Remarques',
      totalPaid: 'Total payé',
      totalEarned: 'Total gagné',
      balance: 'Solde',
      delete: 'Supprimer',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      addSection: 'Ajouter une section',
      noPayments: 'Aucun paiement pour le moment',
    }
  }

  const t = labels[language as keyof typeof labels]

  const calculateSalesmanStats = (salesmanName: string) => {
    const salesmanSales = sales.filter((s: any) => s.salesman === salesmanName)
    const totalEarned = salesmanSales.reduce((sum: number, s: any) => sum + parseFloat(s.commissionAmount || 0), 0)
    const salesmanPayments = payments.filter((p: any) => p.salesman === salesmanName)
    const totalPaid = salesmanPayments.reduce((sum: number, p: any) => sum + parseFloat(p.paymentAmount || 0), 0)
    const balance = totalEarned - totalPaid

    return { totalPaid, totalEarned, balance, payments: salesmanPayments }
  }

  const handleAddPayment = async () => {
    if (!paymentForm.salesman || !paymentForm.paymentDate || !paymentForm.paymentAmount) return
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      })
      mutatePayments()
      setPaymentForm({ salesman: '', paymentDate: '', paymentAmount: '', notes: '' })
      setEditingSalesman(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const handleDeletePayment = async (id: string) => {
    try {
      await fetch(`/api/payments/${id}`, { method: 'DELETE' })
      mutatePayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
    }
  }

  if (salesmenLoading || salesLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="px-8 py-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.title}</h2>
            <p className="text-muted-foreground mt-2">{t.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {salesmen.map((salesman: any, idx: number) => {
            const stats = calculateSalesmanStats(salesman.name)
            const color = sectionColors[idx % sectionColors.length]

            return (
              <div key={salesman._id} className="space-y-4">
                <div className={`${color.bg} rounded-lg p-4 text-white shadow-lg`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">{salesman.name}</h3>
                    <Badge variant="secondary" className="bg-white text-gray-900">
                      {salesman.commissionRate}%
                    </Badge>
                  </div>
                </div>

                <Card className="bg-card/80 backdrop-blur border-border/50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-muted-foreground">{t.totalPaid}:</span>
                        <span className="font-bold text-lg">${stats.totalPaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-muted-foreground">{t.totalEarned}:</span>
                        <span className="font-bold text-lg text-green-600">${stats.totalEarned.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-sm text-muted-foreground">{t.balance}:</span>
                        <span className={`font-bold text-lg ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${stats.balance.toFixed(2)}
                        </span>
                      </div>

                      <Dialog open={editingSalesman === salesman._id} onOpenChange={(open) => {
                        if (!open) setEditingSalesman(null)
                        else {
                          setEditingSalesman(salesman._id)
                          setPaymentForm({ ...paymentForm, salesman: salesman.name })
                          setIsOpen(true)
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent">
                            <Plus size={16} className="mr-2" />
                            {t.addPayment}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t.addPayment} - {salesman.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">{t.paymentDate}</label>
                              <Input
                                type="date"
                                value={paymentForm.paymentDate}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">{t.amount}</label>
                              <Input
                                type="number"
                                value={paymentForm.paymentAmount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentAmount: e.target.value })}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">{t.notes}</label>
                              <Input
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                placeholder="Optional notes"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleAddPayment} className="flex-1">
                                {t.save}
                              </Button>
                              <Button onClick={() => {
                                setEditingSalesman(null)
                                setIsOpen(false)
                              }} variant="outline" className="flex-1">
                                {t.cancel}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">{t.sections}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.payments.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t.noPayments}</p>
                    ) : (
                      <div className="space-y-2">
                        {stats.payments.map((payment: any) => (
                          <div key={payment._id} className="flex justify-between items-center p-2 bg-muted rounded hover:bg-muted/80 transition-colors">
                            <div className="flex-1">
                              <p className="text-xs font-medium">{payment.paymentDate}</p>
                              <p className="text-xs text-muted-foreground">{payment.notes}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">${parseFloat(payment.paymentAmount).toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePayment(payment._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
