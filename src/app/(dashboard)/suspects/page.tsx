import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, User, MoreVertical } from "lucide-react"
import SuspectsFilter from "@/components/suspects-filter"

export default async function SuspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : ""
  const statusFilter = typeof resolvedParams.status === 'string' ? resolvedParams.status : ""

  const suspects = await prisma.suspect.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { fullName: { contains: q } },
            { idNumber: { contains: q } },
            { aliases: { contains: q } }
          ]
        } : {},
        statusFilter ? { status: statusFilter } : {}
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Danh sách Đối tượng Hình sự</h1>
          <p className="text-zinc-400 text-sm mt-1">Quản lý hồ sơ đối tượng, tra cứu và cập nhật thông tin.</p>
        </div>
        <Link 
          href="/suspects/new"
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20"
        >
          <Plus size={16} />
          <span>Thêm Hồ sơ Mới</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <SuspectsFilter initialQ={q} initialStatus={statusFilter} />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Đối tượng</th>
                <th scope="col" className="px-6 py-4 font-medium">Số định danh / CCCD</th>
                <th scope="col" className="px-6 py-4 font-medium">Ngày sinh</th>
                <th scope="col" className="px-6 py-4 font-medium">Trạng thái</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suspects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Không tìm thấy đối tượng nào.
                  </td>
                </tr>
              ) : (
                suspects.map((suspect) => (
                  <tr key={suspect.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                          {suspect.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={suspect.imageUrl} alt={suspect.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200">{suspect.fullName}</div>
                          {suspect.aliases && <div className="text-xs text-zinc-500 mt-0.5">Bí danh: {suspect.aliases}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {suspect.idNumber || "Không rõ"}
                    </td>
                    <td className="px-6 py-4">
                      {suspect.dateOfBirth ? suspect.dateOfBirth.toLocaleDateString('vi-VN') : "Không rõ"}
                    </td>
                    <td className="px-6 py-4">
                      {suspect.status === "WANTED" && <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-medium tracking-wide">TRUY NÃ</span>}
                      {suspect.status === "IN_PRISON" && <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded text-xs font-medium tracking-wide">ĐANG THỤ ÁN</span>}
                      {suspect.status === "RELEASED" && <span className="px-2.5 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded text-xs font-medium tracking-wide">MÃN HẠN</span>}
                      {suspect.status === "UNKNOWN" && <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-medium tracking-wide">CHƯA RÕ</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/suspects/${suspect.id}`} className="text-zinc-500 hover:text-zinc-300 p-2 inline-flex">
                        <MoreVertical size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-500 bg-zinc-950/30">
          <div>Hiển thị <span className="font-medium text-zinc-300">{suspects.length}</span> kết quả</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50" disabled>Trang trước</button>
            <button className="px-3 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50" disabled>Trang sau</button>
          </div>
        </div>
      </div>
    </div>
  )
}
