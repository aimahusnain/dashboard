'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2 } from 'lucide-react';

interface PayrollEntry {
  id?: string;
  name: string;
  date: string;
  numberOfPays: number;
  amountPerPay: number;
  commissionDue: number;
  paymentMade: number;
}


interface PayrollDialogProps {
  entry?: PayrollEntry;
  onSave: (data: PayrollEntry) => Promise<void>;
  isLoading?: boolean;
}

export function PayrollDialog({ entry, onSave, isLoading = false }: PayrollDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PayrollEntry>(
    entry || {
      name: '',
      date: new Date().toISOString().split('T')[0],
      numberOfPays: 1,
      amountPerPay: 0,
      commissionDue: 0,
      paymentMade: 0,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : name === 'date' ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      setOpen(false);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        numberOfPays: 1,
        amountPerPay: 0,
        commissionDue: 0,
        paymentMade: 0,
      });
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`gap-2 ${entry ? '' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'}`}
          variant={entry ? 'outline' : 'default'}
          size={entry ? 'sm' : 'default'}
        >
          {entry ? (
            <>
              <Edit2 className="w-4 h-4" />
              Edit
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Entry
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Entry' : 'New Payroll Entry'}</DialogTitle>
          <DialogDescription>
            {entry ? 'Update the payroll entry details.' : 'Add a new payroll entry to the system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Employee Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter employee name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfPays">Number of Pays</Label>
              <Input
                id="numberOfPays"
                name="numberOfPays"
                type="number"
                min="0"
                step="1"
                value={formData.numberOfPays}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountPerPay">Amount Per Pay</Label>
              <Input
                id="amountPerPay"
                name="amountPerPay"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountPerPay}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionDue">Commission Due</Label>
              <Input
                id="commissionDue"
                name="commissionDue"
                type="number"
                min="0"
                step="0.01"
                value={formData.commissionDue}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMade">Payment Made</Label>
              <Input
                id="paymentMade"
                name="paymentMade"
                type="number"
                min="0"
                step="0.01"
                value={formData.paymentMade}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
