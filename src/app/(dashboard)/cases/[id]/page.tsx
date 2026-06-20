"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar, MapPin, FolderOpen } from "lucide-react";
import { useAuth } from "@/components/providers/session-provider";
import DeleteCaseButton from "./delete-case-button";
import CaseSuspectManager from "./suspect-manager";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CaseDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const isAdmin = true;

  const [kase, setKase] = useState<any>(null);
  const [suspects, setSuspects] = useState<any[]>([]);
  const [allSuspects, setAllSuspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const caseRef = doc(db, "cases", resolvedParams.id);
        const caseSnap = await getDoc(caseRef);

        if (!caseSnap.exists()) {
          router.push("/404");
          return;
        }

        const caseData = caseSnap.data();
        setKase({
          id: caseSnap.id,
          ...caseData,
          date: caseData.date?.toDate(),
          createdAt: caseData.createdAt?.toDate() || new Date(),
          updatedAt: caseData.updatedAt?.toDate() || new Date(),
        });

        // Fetch case suspects
        const csQuery = query(collection(db, "caseSuspects"), where("caseId", "==", resolvedParams.id));
        const csSnap = await getDocs(csQuery);
        
        const linkedSuspects = [];
        for (const csDoc of csSnap.docs) {
          const csData = csDoc.data();
          const suspectRef = doc(db, "suspects", csData.suspectId);
          const suspectSnap = await getDoc(suspectRef);
          if (suspectSnap.exists()) {
            linkedSuspects.push({
              id: csDoc.id,
              role: csData.role,
              suspect: {
                id: suspectSnap.id,
                ...suspectSnap.data()
              }
            });
          }
        }
        setSuspects(linkedSuspects);

        // Fetch all suspects for dropdown
        const allSuspectsSnap = await getDocs(collection(db, "suspects"));
        const allSuspectsList = allSuspectsSnap.docs.map(d => ({
          id: d.id,
          fullName: d.data().fullName,
          aliases: d.data().aliases,
          status: d.data().status,
          idNumber: d.data().idNumber
        }));
        setAllSuspects(allSuspectsList);

      } catch (error) {
        console.error("Error fetching case details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams.id, router]);

  if (loading) {
    return <div className="text-white text-center py-10">Đang tải vụ án...</div>;
  }

  if (!kase) return null;

  const dateFormatted = kase.date ? kase.date.toLocaleDateString('vi-VN') : "Chưa cập nhật";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/cases" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-800">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Hồ sơ Vụ án Chi tiết</h1>
            <p className="text-zinc-400 text-sm mt-1">Mã vụ án: {kase.caseNumber}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link 
            href={`/cases/${kase.id}/edit`}
            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
          >
            <Edit size={16} />
            <span>Chỉnh sửa</span>
          </Link>
          {isAdmin && (
            <DeleteCaseButton caseId={kase.id} caseNumber={kase.caseNumber} caseTitle={kase.title} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tên vụ án</span>
              <h2 className="text-xl font-bold text-white mt-1">{kase.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-zinc-800 py-4">
              <div className="flex items-start space-x-3">
                <Calendar className="text-zinc-500 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-zinc-500">Ngày xảy ra / ghi nhận</p>
                  <p className="text-sm font-medium text-white">{dateFormatted}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FolderOpen className="text-zinc-500 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-zinc-500">Trạng thái điều tra</p>
                  <div className="mt-1">
                    {kase.status === "OPEN" && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-semibold tracking-wide">ĐANG ĐIỀU TRA</span>}
                    {kase.status === "CLOSED" && <span className="px-2 py-0.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded text-xs font-semibold tracking-wide">ĐÃ KHÉP HỒ SƠ</span>}
                    {kase.status === "COLD" && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-semibold tracking-wide">ÁN TREO</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tóm tắt nội dung</span>
              <p className="text-sm text-zinc-300 bg-zinc-950 p-4 rounded-lg border border-zinc-800 leading-relaxed whitespace-pre-wrap">
                {kase.description || "Chưa có tóm tắt chi tiết vụ án."}
              </p>
            </div>
          </div>

          <CaseSuspectManager
            caseId={kase.id}
            initialLinkedSuspects={suspects}
            allSuspects={allSuspects}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={16} className="text-red-500" />
              Địa điểm hiện trường
            </h3>
            
            <p className="text-sm text-white font-medium">{kase.location || "Không rõ địa điểm"}</p>

            {kase.location && (
              <div className="w-full h-64 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                  loading="lazy" 
                  allowFullScreen 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(kase.location)}&output=embed`}
                ></iframe>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-xs text-zinc-500 space-y-2">
            <p>Ngày khởi tạo hồ sơ: {kase.createdAt.toLocaleString('vi-VN')}</p>
            <p>Lần cập nhật cuối: {kase.updatedAt.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
