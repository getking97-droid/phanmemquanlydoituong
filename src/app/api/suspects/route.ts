import { NextResponse } from "next-auth/next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const suspects = await prisma.suspect.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { fullName: { contains: search } },
              { idNumber: { contains: search } },
              { aliases: { contains: search } }
            ]
          } : {},
          status ? { status } : {}
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    // Return the response directly
    return new Response(JSON.stringify(suspects), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to fetch suspects:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    
    // Basic validation
    if (!data.fullName) {
      return new Response("Missing fullName", { status: 400 })
    }

    const suspect = await prisma.suspect.create({
      data: {
        fullName: data.fullName,
        aliases: data.aliases || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        idNumber: data.idNumber || null,
        address: data.address || null,
        bloodType: data.bloodType || null,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        features: data.features || null,
        status: data.status || "UNKNOWN",
        imageUrl: data.imageUrl || null
      }
    })

    return new Response(JSON.stringify(suspect), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to create suspect:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
