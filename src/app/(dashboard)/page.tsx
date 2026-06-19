import { Users, AlertTriangle, Building, FolderClosed } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Tổng quan Hệ thống</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Tổng Đối tượng</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">1,248</div>
            <p className="text-sm text-green-500 mt-1 flex items-center">+12 tháng này</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Lệnh Truy nã</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">84</div>
            <p className="text-sm text-red-500 mt-1 flex items-center">+3 phát lệnh mới</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Đang thụ án</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Building size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">452</div>
            <p className="text-sm text-zinc-500 mt-1 flex items-center">Tại các trại giam</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Hồ sơ Vụ án</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FolderClosed size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">3,192</div>
            <p className="text-sm text-zinc-500 mt-1 flex items-center">Hồ sơ lưu trữ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Biểu đồ giả lập */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Thống kê loại hình tội phạm</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
              <div key={i} className="w-full bg-zinc-800 rounded-t-sm relative group cursor-pointer hover:bg-zinc-700 transition-colors" style={{ height: `${h}%` }}>
                <div className="absolute inset-x-0 bottom-0 bg-red-600/80 rounded-t-sm transition-all group-hover:bg-red-500" style={{ height: `${h * 0.7}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-4">
            <span>Ma túy</span>
            <span>Trộm cắp</span>
            <span>Cố ý gây thương tích</span>
            <span>Lừa đảo</span>
            <span>Khác</span>
          </div>
        </div>

        {/* Danh sách truy nã mới nhất */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Cập nhật Lệnh Truy nã</h3>
            <button className="text-sm text-red-500 hover:text-red-400">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                <div className="w-12 h-12 bg-zinc-800 rounded-md bg-[url('https://i.pravatar.cc/150?img=11')] bg-cover bg-center border border-zinc-700"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">Nguyễn Văn Khuyết Danh</h4>
                  <p className="text-xs text-zinc-400 mt-1">Tội danh: Lừa đảo chiếm đoạt tài sản</p>
                </div>
                <div className="text-xs font-bold px-2 py-1 bg-red-600 text-white rounded">MỚI</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
