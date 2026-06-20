import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditCaseForm from "./edit-form"

interface EditCasePageProps {
  params: Promise<{ id: string }>
}

export default async function EditCasePage({ params }: EditCasePageProps) {
  const resolvedParams = await params
  const kase = await prisma.case.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!kase) {
    notFound()
  }

  // Serialize case data for passing to Client Component
  const serializedCase = {
    id: kase.id,
    caseNumber: kase.caseNumber,
    title: kase.title,
    description: kase.description,
    date: kase.date ? kase.date.toISOString().split("T")[0] : "",
    location: kase.location,
    status: kase.status
  }

  return (
    <EditCaseForm kase={serializedCase} />
  )
}
