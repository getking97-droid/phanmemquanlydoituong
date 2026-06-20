import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, MapPin, FolderOpen } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import DeleteCaseButton from "./delete-case-button"
import CaseSuspectManager from "./suspect-manager"

interface CaseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN"

  const kase = await prisma.case.findUnique({
    where: { id: resolvedParams.id },
    include: {
      suspects: {
        include: {
          suspect: true
        }
      }
    }
  })

  if (!kase) {
    notFound()
  }

  // Fetch all suspects to allow linking them to this case
  const allSuspects = await prisma.suspect.findMany({
    select: {
      id: true,
      fullName: true,
      aliases: true,
      status: true,
      idNumber: true
    },
    orderBy: { fullName: 'asc' }
  })

  // Format date for UI
  const dateFormatted = kase.date ? kase.date.toLocaleDateString('vi-VN') : "Chưa cập nhật"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
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

          {/* Suspect Manager Section */}
          <CaseSuspectManager
            caseId={kase.id}
            linkedSuspects={kase.suspects}
            allSuspects={allSuspects}
          />
        </div>

        {/* Right Side: Map & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          {/* Location Card */}
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

          {/* Metadata Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-xs text-zinc-500 space-y-2">
            <p>Ngày khởi tạo hồ sơ: {kase.createdAt.toLocaleString('vi-VN')}</p>
            <p>Lần cập nhật cuối: {kase.updatedAt.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
