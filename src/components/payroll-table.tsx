"use client"

import { useState } from "react"
import type { PayrollEntry } from "@/types/payroll"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit } from "lucide-react"

interface PayrollTableProps {
  entries: PayrollEntry[]
  onEdit: (entry: PayrollEntry) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function PayrollTable({ entries, onEdit, onDelete, isLoading = false }: PayrollTableProps) {
  const [editingEntry, setEditingEntry] = useState<PayrollEntry | null>(null)
  const [open, setOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleEdit = (entry: PayrollEntry) => {
    setEditingEntry(entry)
    setOpen(true)
  }

  const handleSave = async () => {
    if (editingEntry) {
      await onEdit(editingEntry)
      setOpen(false)
      setEditingEntry(null)
    }
  }

  const updateField = (field: keyof PayrollEntry, value: string | number) => {
    if (!editingEntry) return

    const updated = { ...editingEntry, [field]: value }

    // Recalculate derived fields
    if (field === "numberOfPays" || field === "amountPerPay") {
      updated.totalPaid = updated.numberOfPays * updated.amountPerPay
    }
    if (field === "commissionDue" || field === "paymentMade") {
      updated.balance = updated.commissionDue - updated.paymentMade
    }

    setEditingEntry(updated)
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-20">
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="font-semibold">Employee Name</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="text-right font-semibold">Number of Pays</TableHead>
            <TableHead className="text-right font-semibold">Amount Per Pay</TableHead>
            <TableHead className="text-right font-semibold">Total Paid</TableHead>
            <TableHead className="text-right font-semibold">Commission Due</TableHead>
            <TableHead className="text-right font-semibold">Payment Made</TableHead>
            <TableHead className="text-right font-semibold">Balance</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No payroll entries found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id} className="border-b border-border hover:bg-muted/50">
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell className="text-right">{entry.numberOfPays}</TableCell>
                <TableCell className="text-right">{formatCurrency(entry.amountPerPay)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(entry.totalPaid)}</TableCell>
                <TableCell className="text-right">{formatCurrency(entry.commissionDue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(entry.paymentMade)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(entry.balance)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(entry)} disabled={isLoading}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payroll Entry</DialogTitle>
            <DialogDescription>Update the payroll information for {editingEntry?.name}</DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Employee Name</Label>
                <Input id="name" value={editingEntry.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="numberOfPays">Number of Pays</Label>
                  <Input
                    id="numberOfPays"
                    type="number"
                    value={editingEntry.numberOfPays}
                    onChange={(e) => updateField("numberOfPays", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amountPerPay">Amount Per Pay</Label>
                  <Input
                    id="amountPerPay"
                    type="number"
                    step="0.01"
                    value={editingEntry.amountPerPay}
                    onChange={(e) => updateField("amountPerPay", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Total Paid</Label>
                <Input value={formatCurrency(editingEntry.totalPaid)} disabled className="bg-muted" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="commissionDue">Commission Due</Label>
                  <Input
                    id="commissionDue"
                    type="number"
                    step="0.01"
                    value={editingEntry.commissionDue}
                    onChange={(e) => updateField("commissionDue", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMade">Payment Made</Label>
                  <Input
                    id="paymentMade"
                    type="number"
                    step="0.01"
                    value={editingEntry.paymentMade}
                    onChange={(e) => updateField("paymentMade", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Balance</Label>
                <Input value={formatCurrency(editingEntry.balance)} disabled className="bg-muted" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
