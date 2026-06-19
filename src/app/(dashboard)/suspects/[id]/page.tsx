import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Calendar, MapPin, Edit, FileText, AlertTriangle } from "lucide-react"

export default async function SuspectProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const suspect = await prisma.suspect.findUnique({
    where: { id: resolvedParams.id },
    include: {
      cases: {
        include: {
          case: true
        }
      }
    }
  })

  if (!suspect) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/suspects" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-800">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Hồ sơ Chi tiết</h1>
            <p className="text-zinc-400 text-sm mt-1">Mã HS: {suspect.id.split('-')[0].toUpperCase()}</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700">
          <Edit size={16} />
          <span>Chỉnh sửa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-zinc-800 rounded-full mb-4 border-4 border-zinc-800 overflow-hidden relative">
              {suspect.imageUrl ? (
                <img src={suspect.imageUrl} alt={suspect.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <User size={48} />
                </div>
              )}
              {suspect.status === "WANTED" && (
                <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-white">{suspect.fullName}</h2>
            {suspect.aliases && <p className="text-zinc-400 text-sm mt-1">Bí danh: {suspect.aliases}</p>}

            <div className="mt-4 flex justify-center">
              {suspect.status === "WANTED" && <span className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-sm font-bold tracking-widest flex items-center"><AlertTriangle size={16} className="mr-2" /> TRUY NÃ</span>}
              {suspect.status === "IN_PRISON" && <span className="px-3 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-md text-sm font-bold tracking-widest">ĐANG THỤ ÁN</span>}
              {suspect.status === "RELEASED" && <span className="px-3 py-1.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-md text-sm font-bold tracking-widest">MÃN HẠN</span>}
              {suspect.status === "UNKNOWN" && <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-sm font-bold tracking-widest">CHƯA RÕ</span>}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider text-zinc-500">Đặc điểm nhận dạng</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Chiều cao</span>
                <span className="text-white">{suspect.height ? `${suspect.height} cm` : "Không rõ"}</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Cân nặng</span>
                <span className="text-white">{suspect.weight ? `${suspect.weight} kg` : "Không rõ"}</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Nhóm máu</span>
                <span className="text-white">{suspect.bloodType || "Không rõ"}</span>
              </li>
              <li className="flex flex-col pt-2">
                <span className="text-zinc-400 mb-1">Dấu vết / Đặc điểm nổi bật:</span>
                <span className="text-white bg-zinc-950 p-3 rounded-lg border border-zinc-800">{suspect.features || "Chưa có thông tin ghi nhận"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Detail Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-zinc-800 pb-2">Thông tin Cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-zinc-950 rounded-lg text-zinc-400 border border-zinc-800">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Số định danh / CCCD</p>
                  <p className="text-sm text-white font-medium">{suspect.idNumber || "Chưa cập nhật"}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-zinc-950 rounded-lg text-zinc-400 border border-zinc-800">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Ngày sinh</p>
                  <p className="text-sm text-white font-medium">{suspect.dateOfBirth ? suspect.dateOfBirth.toLocaleDateString('vi-VN') : "Chưa cập nhật"}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 md:col-span-2">
                <div className="p-2 bg-zinc-950 rounded-lg text-zinc-400 border border-zinc-800">
                  <MapPin size={18} />
                </div>
                <div className="w-full">
                  <p className="text-xs text-zinc-500 mb-1">Địa chỉ / Nơi cư trú hiện tại</p>
                  <p className="text-sm text-white font-medium mb-3">{suspect.address || "Chưa cập nhật"}</p>
                  
                  {suspect.address && (
                    <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                        loading="lazy" 
                        allowFullScreen 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(suspect.address)}&output=embed`}
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-zinc-800 pb-2">Lịch sử Vụ án & Tiền án</h3>
            {suspect.cases.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm bg-zinc-950 rounded-lg border border-zinc-800 border-dashed">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                Chưa có lịch sử vụ án nào được ghi nhận
              </div>
            ) : (
              <div className="space-y-4">
                {suspect.cases.map((cs) => (
                  <div key={cs.id} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/cases/${cs.case.id}`} className="font-medium text-red-500 hover:text-red-400 transition-colors">
                        {cs.case.title}
                      </Link>
                      <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-900 rounded">{cs.case.caseNumber}</span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{cs.case.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Vai trò: <span className="text-zinc-300 font-medium">{cs.role || "Chưa xác định"}</span></span>
                      <span className="text-zinc-500">Ngày ghi nhận: {cs.createdAt.toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
