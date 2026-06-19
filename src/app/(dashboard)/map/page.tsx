import { prisma } from "@/lib/prisma"
import SuspectMap from "./suspect-map"

export default async function MapPage() {
  const suspects = await prisma.suspect.findMany({
    select: {
      id: true,
      fullName: true,
      address: true,
      status: true,
      aliases: true,
    },
    where: {
      address: {
        not: null,
      }
    }
  })

  // Group by address for cluster sizing
  const addressGroups: Record<string, { count: number; suspects: typeof suspects }> = {}
  for (const s of suspects) {
    const addr = s.address!.trim()
    if (!addressGroups[addr]) {
      addressGroups[addr] = { count: 0, suspects: [] }
    }
    addressGroups[addr].count++
    addressGroups[addr].suspects.push(s)
  }

  const locations = Object.entries(addressGroups).map(([address, data]) => ({
    address,
    count: data.count,
    suspects: data.suspects,
  }))

  const allSuspectsCount = await prisma.suspect.count()
  const noAddressCount = await prisma.suspect.count({ where: { address: null } })

  return (
    <SuspectMap
      locations={locations}
      totalCount={allSuspectsCount}
      noAddressCount={noAddressCount}
    />
  )
}
