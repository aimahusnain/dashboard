import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(sales || [])
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await prisma.sale.create({
      data: {
        brand: body.brand,
        model: body.model,
        salesman: body.salesman,
        salePrice: parseFloat(body.salePrice || 0),
        saleDate: body.saleDate,
      },
    })
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}
