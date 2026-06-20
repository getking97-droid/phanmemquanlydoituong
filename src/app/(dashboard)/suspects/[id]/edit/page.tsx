import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditSuspectForm from "./edit-form"

interface EditSuspectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSuspectPage({ params }: EditSuspectPageProps) {
  const resolvedParams = await params
  const suspect = await prisma.suspect.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!suspect) {
    notFound()
  }

  // Serialize suspect data so it can be passed to the Client Component
  const serializedSuspect = {
    id: suspect.id,
    fullName: suspect.fullName,
    aliases: suspect.aliases,
    idNumber: suspect.idNumber,
    dateOfBirth: suspect.dateOfBirth ? suspect.dateOfBirth.toISOString().split("T")[0] : "",
    address: suspect.address,
    bloodType: suspect.bloodType,
    height: suspect.height,
    weight: suspect.weight,
    features: suspect.features,
    status: suspect.status,
    imageUrl: suspect.imageUrl
  }

  return (
    <EditSuspectForm suspect={serializedSuspect} />
  )
}
