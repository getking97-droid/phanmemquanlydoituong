"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface DeleteCaseButtonProps {
  caseId: string
  caseNumber: string
  caseTitle: string
}

export default function DeleteCaseButton({ caseId, caseNumber, caseTitle }: DeleteCaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ vụ án "${caseNumber} - ${caseTitle}" không? Mọi thông tin liên kết của đối tượng với vụ án này cũng sẽ bị xóa. Hành động này không thể hoàn tác.`)
    if (!confirmed) return

    setLoading(true)
    try {
      const { deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      await deleteDoc(doc(db, "cases", caseId));
      
      alert("Đã xóa hồ sơ vụ án thành công")
      router.push("/cases")
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
      <span>{loading ? "Đang xóa..." : "Xóa Vụ án"}</span>
    </button>
  )
}
