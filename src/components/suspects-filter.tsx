"use client"

import { Search, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface SuspectsFilterProps {
  initialQ: string
  initialStatus: string
}

export default function SuspectsFilter({ initialQ, initialStatus }: SuspectsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get("q")?.toString() || ""
    
    const params = new URLSearchParams(searchParams.toString())
    if (q) {
      params.set("q", q)
    } else {
      params.delete("q")
    }
    
    router.push(`/suspects?${params.toString()}`)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    
    router.push(`/suspects?${params.toString()}`)
  }

  return (
    <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center justify-between bg-zinc-900/50">
      <form onSubmit={handleSearch} className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <input 
          type="text"
          name="q"
          defaultValue={initialQ}
          placeholder="Tìm kiếm theo Tên, CCCD, Bí danh..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-zinc-100 placeholder:text-zinc-600"
        />
      </form>
      
      <div className="flex space-x-3 w-full sm:w-auto">
        <div className="relative inline-block w-full sm:w-48">
          <select 
            name="status"
            value={initialStatus}
            onChange={handleStatusChange}
            className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 pr-8 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="WANTED">Bị truy nã</option>
            <option value="IN_PRISON">Đang thụ án</option>
            <option value="RELEASED">Mãn hạn tù</option>
            <option value="UNKNOWN">Chưa rõ</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
        </div>
      </div>
    </div>
  )
}
