import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const validations = await prisma.validation.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(validations || [])
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch validations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const result = await prisma.validation.create({
      data: {
        brand: body.brand || null,
        model: body.model || null,
        color: body.color || null,
        category: body.category || null,
        year: body.year || null,
        details: body.details || null,
      },
    })
    
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to create validation' }, { status: 500 })
  }
}
