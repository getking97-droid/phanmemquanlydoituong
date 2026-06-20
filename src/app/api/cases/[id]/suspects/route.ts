import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
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

    if (!data.suspectId) {
      return new Response("Missing suspectId", { status: 400 })
    }

    const association = await prisma.caseSuspect.upsert({
      where: {
        caseId_suspectId: {
          caseId: resolvedParams.id,
          suspectId: data.suspectId
        }
      },
      update: {
        role: data.role || null
      },
      create: {
        caseId: resolvedParams.id,
        suspectId: data.suspectId,
        role: data.role || null
      }
    })

    return new Response(JSON.stringify(association), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to link suspect to case:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const suspectId = searchParams.get("suspectId")

    if (!suspectId) {
      return new Response("Missing suspectId parameter", { status: 400 })
    }

    await prisma.caseSuspect.delete({
      where: {
        caseId_suspectId: {
          caseId: resolvedParams.id,
          suspectId: suspectId
        }
      }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Failed to unlink suspect from case:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
