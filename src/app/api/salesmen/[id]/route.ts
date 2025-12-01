import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const salesman = await prisma.salesman.findUnique({
      where: { id },
    })
    if (!salesman) {
      return Response.json({ error: "Salesman not found" }, { status: 404 })
    }
    return Response.json(salesman)
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Failed to fetch salesman" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log("[v0] PUT /api/salesmen/[id] - ID:", id, "Body:", body)

    if (!body.name || body.commissionRate === undefined) {
      return Response.json({ error: "Name and commission rate are required" }, { status: 400 })
    }

    const result = await prisma.salesman.update({
      where: { id },
      data: {
        name: body.name.trim(),
        commissionRate: Number.parseFloat(body.commissionRate),
      },
    })
    console.log("[v0] Salesman updated successfully:", result)
    return Response.json(result)
  } catch (error) {
    console.error("[v0] Database error:", error)
    return Response.json({ error: "Failed to update salesman" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] Deleting salesman with id:", id)

    const result = await prisma.salesman.delete({
      where: { id },
    })
    return Response.json(result)
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Failed to delete salesman" }, { status: 500 })
  }
}
