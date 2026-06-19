import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Search, Plus, FolderOpen } from "lucide-react"

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : ""

  const cases = await prisma.case.findMany({
    where: q ? {
      OR: [
        { title: { contains: q } },
        { caseNumber: { contains: q } },
      ]
    } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      suspects: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hồ sơ Vụ án</h1>
          <p className="text-zinc-400 text-sm mt-1">Quản lý và theo dõi tiến trình các vụ án.</p>
        </div>
        <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20">
          <Plus size={16} />
          <span>Tạo Vụ án Mới</span>
        </button>
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
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <FolderOpen size={32} className="mx-auto mb-2 opacity-50 text-zinc-600" />
                    Không tìm thấy vụ án nào.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-zinc-300">
                      {c.caseNumber}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {c.title}
                    </td>
                    <td className="px-6 py-4">
                      {c.date ? c.date.toLocaleDateString('vi-VN') : "Không rõ"}
                    </td>
                    <td className="px-6 py-4">
                      {c.suspects.length}
                    </td>
                    <td className="px-6 py-4">
                      {c.status === "OPEN" && <span className="text-red-500">Đang điều tra</span>}
                      {c.status === "CLOSED" && <span className="text-zinc-500">Đã khép hồ sơ</span>}
                      {c.status === "COLD" && <span className="text-blue-500">Án treo</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
