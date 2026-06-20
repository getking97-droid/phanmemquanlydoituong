import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const resolvedParams = await params
    const kase = await prisma.case.findUnique({
      where: { id: resolvedParams.id },
      include: {
        suspects: {
          include: {
            suspect: true
          }
        }
      }
    })

    if (!kase) {
      return new Response("Not Found", { status: 404 })
    }

    return new Response(JSON.stringify(kase), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to fetch case details:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const resolvedParams = await params
    const data = await request.json()

    // Validate unique caseNumber if it changed
    if (data.caseNumber) {
      const existing = await prisma.case.findFirst({
        where: {
          caseNumber: data.caseNumber,
          NOT: { id: resolvedParams.id }
        }
      })
      if (existing) {
        return new Response("Case number already in use", { status: 409 })
      }
    }

    const updatedCase = await prisma.case.update({
      where: { id: resolvedParams.id },
      data: {
        caseNumber: data.caseNumber,
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : null,
        location: data.location,
        status: data.status
      }
    })

    return new Response(JSON.stringify(updatedCase), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to update case:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return new Response("Unauthorized or Forbidden", { status: 403 })
    }

    const resolvedParams = await params

    // Delete relationships first
    await prisma.caseSuspect.deleteMany({
      where: { caseId: resolvedParams.id }
    })

    // Delete case
    await prisma.case.delete({
      where: { id: resolvedParams.id }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete case:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
