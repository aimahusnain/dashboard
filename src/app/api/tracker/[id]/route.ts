import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tracker = await prisma.tracker.findUnique({
      where: { id },
    })
    if (!tracker) {
      return Response.json({ error: 'Tracker entry not found' }, { status: 404 })
    }
    return Response.json(tracker)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch tracker entry' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updatedTracker = await prisma.tracker.update({
      where: { id },
      data: {
        datePurchase: body.datePurchase,
        action: body.action,
        stockNo: body.stockNo,
        category: body.category,
        year: body.year ? parseInt(body.year) : undefined,
        make: body.make,
        model: body.model,
        mileage: body.mileage ? parseFloat(body.mileage) : undefined,
        color: body.color,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : undefined,
        reconciliation: body.reconciliation ? parseFloat(body.reconciliation) : undefined,
        transport: body.transport ? parseFloat(body.transport) : undefined,
        adjustment: body.adjustment ? parseFloat(body.adjustment) : undefined,
        costTotal: body.costTotal ? parseFloat(body.costTotal) : undefined,
        accessCredit: body.accessCredit ? parseFloat(body.accessCredit) : undefined,
        displayedPrice: body.displayedPrice ? parseFloat(body.displayedPrice) : undefined,
        potentialProfit: body.potentialProfit ? parseFloat(body.potentialProfit) : undefined,
        sellStatus: body.sellStatus || false,
        customerName: body.customerName,
        saleDate: body.saleDate,
        paid: body.paid || false,
        arbitration: body.arbitration,
        variableGrossProfit: body.variableGrossProfit ? parseFloat(body.variableGrossProfit) : undefined,
        costGP: body.costGP ? parseFloat(body.costGP) : undefined,
        prGP: body.prGP ? parseFloat(body.prGP) : undefined,
        rebate: body.rebate ? parseFloat(body.rebate) : undefined,
        vassCost: body.vassCost ? parseFloat(body.vassCost) : undefined,
        prAss: body.prAss ? parseFloat(body.prAss) : undefined,
        miscellaneousExpenses: body.miscellaneousExpenses ? parseFloat(body.miscellaneousExpenses) : undefined,
        totalProfit: body.totalProfit ? parseFloat(body.totalProfit) : undefined,
        commission: body.commission ? parseFloat(body.commission) : undefined,
        netProfit: body.netProfit ? parseFloat(body.netProfit) : undefined,
        salesperson: body.salesperson,
        notes: body.notes,
      },
    })
    return Response.json(updatedTracker)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to update tracker entry' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.tracker.delete({
      where: { id },
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to delete tracker entry' }, { status: 500 })
  }
}
