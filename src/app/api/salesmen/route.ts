import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const salesmen = await prisma.salesman.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(salesmen || [])
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch salesmen' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const result = await prisma.salesman.create({
      data: {
        name: body.name,
        commissionRate: parseFloat(body.commissionRate),
      },
    })
    
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to create salesman' }, { status: 500 })
  }
}
