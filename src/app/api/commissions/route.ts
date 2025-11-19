import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const commissions = await prisma.commission.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(commissions || [])
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await prisma.commission.create({
      data: {
        salesman: body.salesman,
        commissionAmount: parseFloat(body.commissionAmount || 0),
        saleDate: body.saleDate,
      },
    })
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}
