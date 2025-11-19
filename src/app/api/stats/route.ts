import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const validationStats = await prisma.validation.count()
    const salesStats = await prisma.sale.count()
    const inventoryStats = await prisma.inventory.count()
    const commissionsStats = await prisma.commission.count()

    return Response.json({
      validation: validationStats,
      sales: salesStats,
      inventory: inventoryStats,
      commissions: commissionsStats,
    })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
