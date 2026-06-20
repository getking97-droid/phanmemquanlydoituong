"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Search as SearchIcon, User, AlertTriangle, FileText, ArrowRight, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [suspects, setSuspects] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setSuspects([]);
        setCases([]);
        return;
      }

      setLoading(true);
      try {
        const lowerQ = query.toLowerCase();

        // Fetch suspects
        const suspectsRef = collection(db, "suspects");
        const suspectsSnap = await getDocs(suspectsRef);
        const filteredSuspects: any[] = [];
        suspectsSnap.forEach(doc => {
          const d = doc.data();
          if (
            d.fullName?.toLowerCase().includes(lowerQ) ||
            d.idNumber?.toLowerCase().includes(lowerQ) ||
            d.aliases?.toLowerCase().includes(lowerQ) ||
            d.address?.toLowerCase().includes(lowerQ)
          ) {
            filteredSuspects.push({ id: doc.id, ...d });
          }
        });

        // Fetch cases
        const casesRef = collection(db, "cases");
        const casesSnap = await getDocs(casesRef);
        const filteredCases: any[] = [];
        casesSnap.forEach(doc => {
          const d = doc.data();
          if (
            d.title?.toLowerCase().includes(lowerQ) ||
            d.caseNumber?.toLowerCase().includes(lowerQ) ||
            d.description?.toLowerCase().includes(lowerQ)
          ) {
            filteredCases.push({ id: doc.id, ...d });
          }
        });

        setSuspects(filteredSuspects.slice(0, 10)); // Take 10
        setCases(filteredCases.slice(0, 10)); // Take 10
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchIcon size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tra cứu Thông tin</h1>
          <p className="text-zinc-400 mt-2">Tìm kiếm nhanh đối tượng hình sự, số định danh, địa chỉ hoặc hồ sơ vụ án.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Nhập tên, số CCCD, bí danh hoặc tên vụ án..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {query && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">
            Kết quả tìm kiếm cho: <span className="text-red-500">&quot;{query}&quot;</span>
          </h2>

          {loading ? (
            <div className="text-zinc-400 text-center py-10">Đang tìm kiếm...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Suspects Results */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center">
                  <User size={16} className="mr-2" /> Đối tượng ({suspects.length})
                </h3>
                
                {suspects.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">Không tìm thấy đối tượng nào khớp.</p>
                ) : (
                  suspects.map(suspect => (
                    <Link href={`/suspects/detail?id=${suspect.id}`} key={suspect.id} className="block bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-xl p-4 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                            {suspect.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={suspect.imageUrl} alt={suspect.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={20} /></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-white group-hover:text-red-400 transition-colors">{suspect.fullName}</h4>
                            <p className="text-xs text-zinc-500">{suspect.idNumber || "Không rõ CCCD"}</p>
                          </div>
                        </div>
                        {suspect.status === "WANTED" && <AlertTriangle size={16} className="text-red-500" />}
                      </div>
                      {suspect.address && (
                        <div className="mt-3 flex items-start text-xs text-zinc-400">
                          <MapPin size={12} className="mr-1.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{suspect.address}</span>
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>

              {/* Cases Results */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center">
                  <FileText size={16} className="mr-2" /> Vụ án ({cases.length})
                </h3>
                
                {cases.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">Không tìm thấy vụ án nào khớp.</p>
                ) : (
                  cases.map(c => (
                    <Link href={`/cases/detail?id=${c.id}`} key={c.id} className="block bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-xl p-4 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white group-hover:text-red-400 transition-colors line-clamp-1 pr-4">{c.title}</h4>
                        <ArrowRight size={16} className="text-zinc-600 group-hover:text-red-500 transition-colors shrink-0" />
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-zinc-500">
                        <span className="px-2 py-1 bg-zinc-950 rounded">{c.caseNumber}</span>
                        <span>{c.status}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-10">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
