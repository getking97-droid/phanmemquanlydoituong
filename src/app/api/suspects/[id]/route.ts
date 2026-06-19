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

    const suspect = await prisma.suspect.findUnique({
      where: { id: params.id },
      include: {
        cases: {
          include: {
            case: true
          }
        }
      }
    })

    if (!suspect) {
      return new Response("Not Found", { status: 404 })
    }

    return new Response(JSON.stringify(suspect), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to fetch suspect:", error)
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

    const data = await request.json()

    const suspect = await prisma.suspect.update({
      where: { id: params.id },
      data: {
        fullName: data.fullName,
        aliases: data.aliases,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        idNumber: data.idNumber,
        address: data.address,
        bloodType: data.bloodType,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        features: data.features,
        status: data.status,
        imageUrl: data.imageUrl
      }
    })

    return new Response(JSON.stringify(suspect), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to update suspect:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return new Response("Unauthorized or Forbidden", { status: 403 })
    }

    await prisma.caseSuspect.deleteMany({
      where: { suspectId: params.id }
    })

    await prisma.suspect.delete({
      where: { id: params.id }
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete suspect:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
