"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      caseNumber: formData.get("caseNumber"),
      title: formData.get("title"),
      date: formData.get("date"),
      location: formData.get("location"),
      description: formData.get("description"),
      status: formData.get("status"),
    };

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/cases");
        router.refresh();
      } else if (res.status === 409) {
        alert("Mã vụ án đã tồn tại trong hệ thống");
      } else {
        alert("Lỗi khi tạo vụ án mới");
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
        <Link href="/cases" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-800">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tạo Vụ án Mới</h1>
          <p className="text-zinc-400 text-sm mt-1">Nhập thông tin ban đầu về hồ sơ vụ án mới.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-2">Thông tin vụ án</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Mã Vụ án (*)</label>
                <input required type="text" name="caseNumber" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="VA-2026-XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Tên Vụ án (*)</label>
                <input required type="text" name="title" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="Vụ án trộm cắp..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Ngày xảy ra / ghi nhận</label>
                <input type="date" name="date" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Trạng thái hồ sơ</label>
                <select name="status" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                  <option value="OPEN">Đang điều tra (OPEN)</option>
                  <option value="CLOSED">Đã khép hồ sơ (CLOSED)</option>
                  <option value="COLD">Án treo / Tạm đình chỉ (COLD)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Địa điểm xảy ra</label>
                <input type="text" name="location" className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="Số nhà, tên đường, khu vực..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Tóm tắt nội dung vụ án</label>
                <textarea name="description" rows={5} className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="Mô tả tóm tắt sự việc, diễn biến, hành vi phạm tội..."></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end space-x-4">
            <Link href="/cases" className="px-6 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent">
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
                  <span>Tạo vụ án</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
