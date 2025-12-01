import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const trackers = await prisma.tracker.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(trackers)
  } catch (error) {
    console.error("Database error:", error)
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[Tracker] POST /api/tracker - Creating single vehicle:", body)

    // Convert string values to proper types
    const data: any = {
      datePurchase: body.datePurchase || undefined,
      action: body.action || undefined,
      stockNo: body.stockNo || undefined,
      category: body.category || undefined,
      year: body.year ? Number.parseInt(body.year.toString()) : undefined,
      make: body.make || undefined,
      model: body.model || undefined,
      mileage: body.mileage ? Number.parseFloat(body.mileage.toString()) : undefined,
      color: body.color || undefined,
      purchasePrice: body.purchasePrice ? Number.parseFloat(body.purchasePrice.toString()) : undefined,
      reconciliation: body.reconciliation ? Number.parseFloat(body.reconciliation.toString()) : undefined,
      esthetique: body.esthetique ? Number.parseFloat(body.esthetique.toString()) : undefined,
      transport: body.transport ? Number.parseFloat(body.transport.toString()) : undefined,
      adjustment: body.adjustment ? Number.parseFloat(body.adjustment.toString()) : undefined,
      costTotal: body.costTotal ? Number.parseFloat(body.costTotal.toString()) : undefined,
      accessCredit: body.accessCredit ? Number.parseFloat(body.accessCredit.toString()) : undefined,
      blackBook: body.blackBook ? Number.parseFloat(body.blackBook.toString()) : undefined,
      displayedPrice: body.displayedPrice ? Number.parseFloat(body.displayedPrice.toString()) : undefined,
      potentialProfit: body.potentialProfit ? Number.parseFloat(body.potentialProfit.toString()) : undefined,
      sellStatus: body.sellStatus === true || body.sellStatus === "true",
      reserve: body.reserve === true || body.reserve === "true",
      customerName: body.customerName || undefined,
      saleDate: body.saleDate || undefined,
      paid: body.paid || undefined,
      arbitration: body.arbitration || undefined,
      variableGrossProfit: body.variableGrossProfit ? Number.parseFloat(body.variableGrossProfit.toString()) : undefined,
      costGP: body.costGP ? Number.parseFloat(body.costGP.toString()) : undefined,
      prGP: body.prGP ? Number.parseFloat(body.prGP.toString()) : undefined,
      rebate: body.rebate ? Number.parseFloat(body.rebate.toString()) : undefined,
      vassCost: body.vassCost ? Number.parseFloat(body.vassCost.toString()) : undefined,
      prAss: body.prAss ? Number.parseFloat(body.prAss.toString()) : undefined,
      miscellaneousExpenses: body.miscellaneousExpenses ? Number.parseFloat(body.miscellaneousExpenses.toString()) : undefined,
      totalProfit: body.totalProfit ? Number.parseFloat(body.totalProfit.toString()) : undefined,
      commission: body.commission ? Number.parseFloat(body.commission.toString()) : undefined,
      netProfit: body.netProfit ? Number.parseFloat(body.netProfit.toString()) : undefined,
      salesperson: body.salesperson || undefined,
      notes: body.notes || undefined,
    }

    // Remove undefined values
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key]
      }
    })

    console.log("[Tracker] Cleaned data:", data)

    const result = await prisma.tracker.create({ data })
    console.log("[Tracker] Created vehicle:", result)

    return Response.json(result, { status: 201 })
  } catch (error: any) {
    console.error("Database error:", error)
    return Response.json({ error: error.message || "Failed to create tracker entry" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await prisma.tracker.deleteMany({})
    return Response.json({ message: "All tracker entries deleted successfully" })
  } catch (error: any) {
    console.error("Database error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}