"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SuspectMap from "./suspect-map";

export default function MapPage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [noAddressCount, setNoAddressCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const suspectsRef = collection(db, "suspects");
        const querySnapshot = await getDocs(suspectsRef);
        
        const suspects: any[] = [];
        let allCount = 0;
        let noAddrCount = 0;

        querySnapshot.forEach((doc) => {
          allCount++;
          const data = doc.data();
          if (data.address) {
            suspects.push({
              id: doc.id,
              fullName: data.fullName,
              address: data.address,
              status: data.status,
              aliases: data.aliases || null,
            });
          } else {
            noAddrCount++;
          }
        });

        const addressGroups: Record<string, { count: number; suspects: any[] }> = {};
        for (const s of suspects) {
          const addr = s.address!.trim();
          if (!addressGroups[addr]) {
            addressGroups[addr] = { count: 0, suspects: [] };
          }
          addressGroups[addr].count++;
          addressGroups[addr].suspects.push(s);
        }

        const locs = Object.entries(addressGroups).map(([address, data]) => ({
          address,
          count: data.count,
          suspects: data.suspects,
        }));

        setLocations(locs);
        setTotalCount(allCount);
        setNoAddressCount(noAddrCount);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-10">Đang tải bản đồ...</div>;
  }

  return (
    <SuspectMap
      locations={locations}
      totalCount={totalCount}
      noAddressCount={noAddressCount}
    />
  );
}
