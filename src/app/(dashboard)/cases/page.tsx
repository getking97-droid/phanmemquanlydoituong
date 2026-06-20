"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Search, Plus, FolderOpen } from "lucide-react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

export interface CaseData {
  id: string;
  title: string;
  caseNumber: string;
  date?: Date;
  status: string;
  suspectsCount: number;
}

function CasesList() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const casesRef = collection(db, "cases");
        const qSnapshot = await getDocs(query(casesRef, orderBy("createdAt", "desc")));
        
        let fetchedCases: CaseData[] = [];
        for (const doc of qSnapshot.docs) {
          const data = doc.data();
          
          // Get suspect count for this case
          const csQuery = query(collection(db, "caseSuspects"), where("caseId", "==", doc.id));
          const csSnap = await getDocs(csQuery);

          fetchedCases.push({
            id: doc.id,
            title: data.title,
            caseNumber: data.caseNumber,
            date: data.date?.toDate(),
            status: data.status,
            suspectsCount: csSnap.size
          });
        }

        // Filter
        if (q) {
          const lowerQ = q.toLowerCase();
          fetchedCases = fetchedCases.filter(c => 
            c.title.toLowerCase().includes(lowerQ) || 
            c.caseNumber.toLowerCase().includes(lowerQ)
          );
        }

        setCases(fetchedCases);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hồ sơ Vụ án</h1>
          <p className="text-zinc-400 text-sm mt-1">Quản lý và theo dõi tiến trình các vụ án.</p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20"
        >
          <Plus size={16} />
          <span>Tạo Vụ án Mới</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center justify-between bg-zinc-900/50">
          <form className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Tìm kiếm mã vụ án, tên vụ án..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-zinc-100 placeholder:text-zinc-600"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Mã Vụ án</th>
                <th scope="col" className="px-6 py-4 font-medium">Tên Vụ án</th>
                <th scope="col" className="px-6 py-4 font-medium">Ngày xảy ra</th>
                <th scope="col" className="px-6 py-4 font-medium">Số đối tượng</th>
                <th scope="col" className="px-6 py-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <FolderOpen size={32} className="mx-auto mb-2 opacity-50 text-zinc-600" />
                    Không tìm thấy vụ án nào.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <Link href={`/cases/${c.id}`} className="text-zinc-300 hover:text-red-500 transition-colors">
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/cases/${c.id}`} className="text-white font-medium hover:text-red-500 transition-colors">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {c.date ? c.date.toLocaleDateString('vi-VN') : "Không rõ"}
                    </td>
                    <td className="px-6 py-4">
                      {c.suspectsCount}
                    </td>
                    <td className="px-6 py-4">
                      {c.status === "OPEN" && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-medium tracking-wide">ĐANG ĐIỀU TRA</span>}
                      {c.status === "CLOSED" && <span className="px-2 py-0.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded text-xs font-medium tracking-wide">ĐÃ KHÉP HỒ SƠ</span>}
                      {c.status === "COLD" && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-medium tracking-wide">ÁN TREO</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <CasesList />
    </Suspense>
  );
}
