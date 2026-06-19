"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewSuspectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName"),
      aliases: formData.get("aliases"),
      idNumber: formData.get("idNumber"),
      dateOfBirth: formData.get("dateOfBirth"),
      address: formData.get("address"),
      status: formData.get("status"),
      features: formData.get("features"),
    };

    try {
      const res = await fetch("/api/suspects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/suspects");
        router.refresh();
      } else {
        alert("Lỗi khi thêm hồ sơ");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/suspects" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-800">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Thêm Hồ sơ Mới</h1>
          <p className="text-zinc-400 text-sm mt-1">Nhập thông tin chi tiết về đối tượng hình sự.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Thông tin Cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Họ và Tên (*)</label>
                <input required type="text" name="fullName" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Bí danh (nếu có)</label>
                <input type="text" name="aliases" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="A Mập, A Đen..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Số định danh / CCCD</label>
                <input type="text" name="idNumber" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="012345678910" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Ngày sinh</label>
                <input type="date" name="dateOfBirth" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Địa chỉ / Nơi ở hiện tại</label>
                <input type="text" name="address" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="Số nhà, đường, phường/xã..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Đặc điểm nhận dạng & Tình trạng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Đặc điểm nổi bật (Sẹo, hình xăm...)</label>
                <textarea name="features" rows={3} className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="Sẹo tròn 2cm dưới mắt trái..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Trạng thái hồ sơ</label>
                <select name="status" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                  <option value="UNKNOWN">Chưa rõ / Đang theo dõi</option>
                  <option value="WANTED">Đang bị truy nã</option>
                  <option value="IN_PRISON">Đang thụ án</option>
                  <option value="RELEASED">Đã mãn hạn tù</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end space-x-4">
            <Link href="/suspects" className="px-6 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent">
              Hủy bỏ
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu Hồ sơ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
