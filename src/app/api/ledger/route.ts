// app/api/ledger/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const salesman = searchParams.get('salesman')

    // Fetch all salesmen for commission rates
    const salesmen = await prisma.salesman.findMany({
      select: {
        id: true,
        name: true,
        commissionRate: true,
      },
    })

    // Fetch tracker data where sellStatus is true (sold items)
    let trackerQuery: any = {
      where: {
        sellStatus: true,
        salesperson: {
          not: null,
        },
      },
      select: {
        id: true,
        salesperson: true,
        saleDate: true,
        totalProfit: true,
        commission: true,
      },
      orderBy: {
        saleDate: 'desc',
      },
    }

    // Filter by salesman if provided
    if (salesman) {
      trackerQuery.where.salesperson = salesman
    }

    const trackerData = await prisma.tracker.findMany(trackerQuery)

    // Fetch all payments
    const payments = await prisma.payment.findMany({
      select: {
        salesman: true,
        paymentDate: true,
        paymentAmount: true,
      },
      orderBy: {
        paymentDate: 'desc',
      },
    })

    // Create a map of commission rates
    const commissionRateMap = new Map(
      salesmen.map(s => [s.name, s.commissionRate])
    )

    // Transform tracker data to ledger entries
    const ledgerEntries = trackerData.map(entry => {
      const rate = commissionRateMap.get(entry.salesperson || '') || 0
      const normalizedRate = rate > 1 ? rate / 100 : rate
      const profit = entry.totalProfit || 0
      const commissionDue = profit * normalizedRate

      return {
        name: entry.salesperson,
        date: entry.saleDate,
        profitTotal: profit,
        commissionDue: commissionDue,
        paymentMade: 0, // Will be calculated from payments
        type: 'sale' as const,
      }
    })

    // Add payment entries
    const paymentEntries = payments.map(payment => ({
      name: payment.salesman,
      date: payment.paymentDate,
      profitTotal: 0,
      commissionDue: 0,
      paymentMade: payment.paymentAmount,
      type: 'payment' as const,
    }))

    // Combine and sort all entries by date
    const allEntries = [...ledgerEntries, ...paymentEntries].sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0
      const bDate = b.date ? new Date(b.date).getTime() : 0
      return bDate - aDate
    })

    // Calculate running balance for each salesman
    const balanceMap = new Map<string, number>()
    
    const enrichedEntries = allEntries.map(entry => {
      const currentBalance = balanceMap.get(entry.name || '') || 0
      const newBalance = currentBalance + (entry.commissionDue || 0) - (entry.paymentMade || 0)
      balanceMap.set(entry.name || '', newBalance)

      return {
        ...entry,
        balance: newBalance,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        salesmen,
        ledgerEntries: enrichedEntries,
      },
    })
  } catch (error) {
    console.error('Ledger API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ledger data',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}