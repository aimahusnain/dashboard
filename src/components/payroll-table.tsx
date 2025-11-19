'use client';

import { PayrollEntry } from '@/types/payroll';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PayrollDialog } from './ui/payroll-dialog';
import { Trash2 } from 'lucide-react';

interface PayrollTableProps {
  entries: PayrollEntry[];
  onEdit: (entry: PayrollEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function PayrollTable({ entries, onEdit, onDelete, isLoading = false }: PayrollTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
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
            entries.map(entry => (
              <TableRow key={entry.id} className="border-b border-border hover:bg-muted/50">
                <TableCell className="font-medium">{entry.name}</TableCell>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell className="text-right">{entry.numberOfPays}</TableCell>
                <TableCell className="text-right">{formatCurrency(entry.amountPerPay)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(entry.totalPaid)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(entry.commissionDue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(entry.paymentMade)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(entry.balance)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {/* <PayrollDialog entry={entry} onSave={onEdit} isLoading={isLoading} /> */}
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
    </div>
  );
}
