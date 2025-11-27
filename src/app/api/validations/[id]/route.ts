import { prisma } from '@/lib/prisma'

export async function DELETE(context: any) {
  try {
    const { id } = await context.params

    await prisma.validation.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to delete validation' }, { status: 500 })
  }
}
