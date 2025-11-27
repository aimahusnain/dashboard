import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  context: any
) {
  try {
    const id = context?.params?.id

    await prisma.commission.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to delete commission' }, { status: 500 })
  }
}
