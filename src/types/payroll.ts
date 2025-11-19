export interface PayrollEntry {
  id: string;
  name: string;
  date: string;
  numberOfPays: number;
  amountPerPay: number;
  totalPaid: number;
  commissionDue: number;
  paymentMade: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}
