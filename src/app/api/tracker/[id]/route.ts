import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma" // adjust path

export async function GET(
  request: Request,           // first argument must be Request or NextRequest
  { params }: { params: { id: string } } // second argument contains params
) {
  try {
    const { id } = params

    const tracker = await prisma.tracker.findUnique({
      where: { id },
    })

    if (!tracker) {
      return NextResponse.json({ error: "Tracker entry not found" }, { status: 404 })
    }

    return NextResponse.json(tracker)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch tracker entry" }, { status: 500 })
  }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    const updatedTracker = await prisma.tracker.update({
      where: { id },
      data: {
        datePurchase: body.datePurchase,
        action: body.action,
        stockNo: body.stockNo,
        category: body.category,
        year: body.year ? Number.parseInt(body.year) : undefined,
        make: body.make,
        model: body.model,
        mileage: body.mileage ? Number.parseFloat(body.mileage) : undefined,
        color: body.color,
        purchasePrice: body.purchasePrice ? Number.parseFloat(body.purchasePrice) : undefined,
        reconciliation: body.reconciliation ? Number.parseFloat(body.reconciliation) : undefined,
        transport: body.transport ? Number.parseFloat(body.transport) : undefined,
        adjustment: body.adjustment ? Number.parseFloat(body.adjustment) : undefined,
        costTotal: body.costTotal ? Number.parseFloat(body.costTotal) : undefined,
        accessCredit: body.accessCredit ? Number.parseFloat(body.accessCredit) : undefined,
        displayedPrice: body.displayedPrice ? Number.parseFloat(body.displayedPrice) : undefined,
        potentialProfit: body.potentialProfit ? Number.parseFloat(body.potentialProfit) : undefined,
        sellStatus: body.sellStatus || false,
        customerName: body.customerName,
        saleDate: body.saleDate,
        paid: body.paid || false,
        arbitration: body.arbitration,
        variableGrossProfit: body.variableGrossProfit ? Number.parseFloat(body.variableGrossProfit) : undefined,
        costGP: body.costGP ? Number.parseFloat(body.costGP) : undefined,
        prGP: body.prGP ? Number.parseFloat(body.prGP) : undefined,
        rebate: body.rebate ? Number.parseFloat(body.rebate) : undefined,
        vassCost: body.vassCost ? Number.parseFloat(body.vassCost) : undefined,
        prAss: body.prAss ? Number.parseFloat(body.prAss) : undefined,
        miscellaneousExpenses: body.miscellaneousExpenses ? Number.parseFloat(body.miscellaneousExpenses) : undefined,
        totalProfit: body.totalProfit ? Number.parseFloat(body.totalProfit) : undefined,
        commission: body.commission ? Number.parseFloat(body.commission) : undefined,
        netProfit: body.netProfit ? Number.parseFloat(body.netProfit) : undefined,
        salesperson: body.salesperson,
        notes: body.notes,
      },
    })
    return Response.json(updatedTracker)
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Failed to update tracker entry" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (id === "delete-all") {
      await prisma.tracker.deleteMany({})
      return Response.json({ success: true, message: "All tracker entries deleted successfully" })
    }

    await prisma.tracker.delete({
      where: { id },
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Failed to delete tracker entry" }, { status: 500 })
  }
}
