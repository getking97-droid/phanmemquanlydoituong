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

    const cases = await prisma.case.findMany({
      where: search ? {
        OR: [
          { title: { contains: search } },
          { caseNumber: { contains: search } }
        ]
      } : {},
      include: {
        suspects: {
          include: {
            suspect: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return new Response(JSON.stringify(cases), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to fetch cases:", error)
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
    if (!data.caseNumber || !data.title) {
      return new Response("Missing caseNumber or title", { status: 400 })
    }

    // Check if case number is unique
    const existingCase = await prisma.case.findUnique({
      where: { caseNumber: data.caseNumber }
    })
    if (existingCase) {
      return new Response("Case number already exists", { status: 409 })
    }

    const newCase = await prisma.case.create({
      data: {
        caseNumber: data.caseNumber,
        title: data.title,
        description: data.description || null,
        date: data.date ? new Date(data.date) : null,
        location: data.location || null,
        status: data.status || "OPEN"
      }
    })

    return new Response(JSON.stringify(newCase), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to create case:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
