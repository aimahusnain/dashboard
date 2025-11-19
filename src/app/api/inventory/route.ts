import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(inventory || [])
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await prisma.inventory.create({
      data: {
        brand: body.brand,
        model: body.model,
        color: body.color,
        year: body.year ? parseInt(body.year) : undefined,
        price: body.price ? parseFloat(body.price) : undefined,
        quantity: body.quantity ? parseInt(body.quantity) : 1,
      },
    })
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to create inventory item' }, { status: 500 })
  }
}
