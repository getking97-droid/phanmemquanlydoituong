"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface DeleteButtonProps {
  suspectId: string
  suspectName: string
}

export default function DeleteButton({ suspectId, suspectName }: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ đối tượng "${suspectName}" không? Hành động này không thể hoàn tác.`)
    if (!confirmed) return

    setLoading(true)
    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      await deleteDoc(doc(db, "suspects", suspectId));
      
      alert("Đã xóa hồ sơ thành công")
      router.push("/suspects")
    } catch (error) {
      console.error(error)
      alert("Lỗi kết nối khi thực hiện xóa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center space-x-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-900/50 disabled:opacity-50"
    >
      <Trash2 size={16} />
      <span>{loading ? "Đang xóa..." : "Xóa Hồ sơ"}</span>
    </button>
  )
}
