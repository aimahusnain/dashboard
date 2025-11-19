import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.commission.delete({
      where: { id },
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to delete commission' }, { status: 500 })
  }
}
