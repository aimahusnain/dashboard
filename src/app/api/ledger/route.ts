import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const ledgerEntries = await prisma.payrollEntry.findMany({
      orderBy: { date: "desc" },
    })

    const trackerData = await prisma.tracker.findMany()

    // Create a map of salesperson to total commission from tracker
    const commissionMap = new Map<string, number>()
    for (const tracker of trackerData) {
      if (tracker.salesperson && tracker.commission) {
        const current = commissionMap.get(tracker.salesperson) || 0
        commissionMap.set(tracker.salesperson, current + tracker.commission)
      }
    }

    const ledger = ledgerEntries.map((entry) => {
      const commissionDue = commissionMap.get(entry.name) || 0
      const paymentMade = entry.paymentMade || 0
      const balance = commissionDue - paymentMade

      return {
        date: entry.date,
        name: entry.name,
        commissionDue,
        paymentMade,
        balance,
      }
    })

    return Response.json(ledger)
  } catch (error) {
    console.error("Error fetching ledger entries:", error)
    return Response.json({ error: "Failed to fetch ledger entries" }, { status: 500 })
  }
}
