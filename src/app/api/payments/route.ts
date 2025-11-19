import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
    })
    return Response.json(payments || [])
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const result = await prisma.payment.create({
      data: {
        salesman: body.salesman,
        paymentDate: body.paymentDate,
        paymentAmount: parseFloat(String(body.paymentAmount ?? 0)),
        notes: body.notes || '',
      },
    })
    
    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
