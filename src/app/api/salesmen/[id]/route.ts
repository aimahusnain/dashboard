import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.salesman.delete({
      where: { id },
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to delete salesman' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updatedSalesman = await prisma.salesman.update({
      where: { id },
      data: {
        name: body.name,
        commissionRate: parseFloat(body.commissionRate),
      },
    })
    return Response.json(updatedSalesman)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to update salesman' }, { status: 500 })
  }
}
