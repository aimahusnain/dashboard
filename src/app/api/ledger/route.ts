import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const payrollEntries = await prisma.payrollEntry.findMany({
      orderBy: { date: "desc" },
    })

    const salesmen = await prisma.salesman.findMany()

    // Create a map of salesman name to commission rate
    const commissionRateMap = new Map<string, number>()
    for (const salesman of salesmen) {
      // Normalize rate: treat > 1 as percentage (e.g., 25 => 0.25)
      const rate = salesman.commissionRate > 1 ? salesman.commissionRate / 100 : salesman.commissionRate
      commissionRateMap.set(salesman.name, rate)
    }

    const ledger = payrollEntries.map((entry) => {
      const totalPaid = Number(entry.totalPaid) || 0
      const rate = commissionRateMap.get(entry.name) || 0
      const commissionEarned = totalPaid * rate
      const paymentMade = Number(entry.paymentMade) || 0
      const commissionDue = commissionEarned - paymentMade

      return {
        date: entry.date,
        name: entry.name,
        totalPaid,
        commissionDue,
        paymentMade,
        balance: commissionDue,
        salesman: entry.name,
      }
    })

    return Response.json(ledger)
  } catch (error) {
    console.error("Error fetching ledger entries:", error)
    return Response.json({ error: "Failed to fetch ledger entries" }, { status: 500 })
  }
}
