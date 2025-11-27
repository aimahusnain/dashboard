import { prisma } from '@/lib/prisma'

export async function DELETE(_request: Request, context: any) {
  try {
    const { id } = await context.params

    await prisma.sale.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to delete sale' }, { status: 500 })
  }
}
