import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 })
    }

    console.log("[v0] Deleting salesman with id:", id)

    const result = await prisma.salesman.delete({
      where: { id: id as string }, // Explicitly cast id to string
    })
    return Response.json(result)
  } catch (error) {
    console.error("Database error:", error)
    return Response.json({ error: "Failed to delete salesman" }, { status: 500 })
  }
}
