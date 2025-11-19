// 'use client';

// import { useState } from 'react';
// import { PayrollEntry } from '@/types/payroll';
// // import { PayrollTable } from '@/components/payroll-table';
// import { PayrollDialog } from '@/components/ui/payroll-dialog';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { DollarSign, TrendingUp, Users } from 'lucide-react';
// import useSWR from 'swr';

// const fetcher = (url: string) => fetch(url).then(r => r.json());

// export default function PayrollEntriesPage() {
//   // const [isLoading, setIsLoading] = useState(false);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   // const { data: entries = [], mutate, isLoading } = useSWR<PayrollEntry[]>('/api/payroll', fetcher);

//   const showNotification = (message: string) => {
//     setToastMessage(message);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const calculateTotals = () => {
//     return {
//       totalPaid: entries.reduce((sum, e) => sum + e.totalPaid, 0),
//       totalCommission: entries.reduce((sum, e) => sum + e.commissionDue, 0),
//       totalBalance: entries.reduce((sum, e) => sum + e.balance, 0),
//     };
//   };

//   const totals = calculateTotals();

//   const handleAddEntry = async (data: any) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/payroll', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         mutate();
//         showNotification('Entry added successfully!');
//       }
//     } catch  {
//       showNotification('Error adding entry');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const handleEditEntry = async (data: any) => {
//   //   if (!data.id) return;
//   //   setIsLoading(true);
//   //   try {
//   //     const response = await fetch(`/api/payroll/${data.id}`, {
//   //       method: 'PUT',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify(data),
//   //     });

//   //     if (response.ok) {
//   //       mutate();
//   //       showNotification('Entry updated successfully!');
//   //     }
//   //   } catch  {
//   //     showNotification('Error updating entry');
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const handleDeleteEntry = async (id: string) => {
//   //   if (!confirm('Are you sure you want to delete this entry?')) return;
//   //   setIsLoading(true);
//   //   try {
//   //     const response = await fetch(`/api/payroll/${id}`, {
//   //       method: 'DELETE',
//   //     });

//   //     if (response.ok) {
//   //       mutate();
//   //       showNotification('Entry deleted successfully!');
//   //     }
//   //   } catch  {
//   //     showNotification('Error deleting entry');
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const formatCurrency = (value: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(value);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="sticky top-0 z-20 border-b border-border/40 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-lg">
//         <div className="px-8 py-6 flex justify-between items-center">
//           <div className="space-y-2">
//             <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
//               Payroll Entries
//             </h2>
//             <p className="text-muted-foreground text-sm">Manage and track employee payroll records</p>
//           </div>

//           <PayrollDialog onSave={handleAddEntry} isLoading={isLoading} />
//         </div>
//       </header>

//       <div className="p-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-border/80 transition-colors">
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
//               <DollarSign className="w-5 h-5 text-emerald-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(totals.totalPaid)}</div>
//               <p className="text-xs text-muted-foreground mt-1">{entries.length} entries</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-border/80 transition-colors">
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Commission Due</CardTitle>
//               <TrendingUp className="w-5 h-5 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(totals.totalCommission)}</div>
//               <p className="text-xs text-muted-foreground mt-1">Outstanding</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-border/80 transition-colors">
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
//               <Users className="w-5 h-5 text-purple-600" />
//             </CardHeader>
//             <CardContent>
//               <div className={`text-2xl font-bold ${totals.totalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
//                 {formatCurrency(totals.totalBalance)}
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">Total balance</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Table Card */}
//         <Card className="bg-card/50 backdrop-blur border-border/50">
//           <CardHeader>
//             <CardTitle>Payroll Records</CardTitle>
//             <CardDescription>View and manage all payroll entries</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {/* {isFetching ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 className="animate-spin text-primary w-8 h-8" />
//               </div>
//             ) : (
//               <PayrollTable
//                 entries={entries}
//                 onEdit={handleEditEntry}
//                 onDelete={handleDeleteEntry}
//                 isLoading={isLoading}
//               />
//             )} */}
//           </CardContent>
//         </Card>
//       </div>

//       {showToast && (
//         <div className="fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg animate-in slide-in-from-bottom-5 bg-green-600">
//           {toastMessage}
//         </div>
//       )}
//     </div>
//   );
// }


import React from 'react'

export const page = () => {
  return (
    <div>page</div>
  )
}
