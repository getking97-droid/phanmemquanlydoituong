"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Plus, UserMinus } from "lucide-react"
import Link from "next/link"
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SuspectInfo {
  id: string
  fullName: string
  aliases: string | null
  status: string
  idNumber: string | null
}

interface CaseSuspectLink {
  id: string
  suspectId?: string
  role: string | null
  suspect: SuspectInfo
}

interface SuspectManagerProps {
  caseId: string
  initialLinkedSuspects: CaseSuspectLink[]
  allSuspects: SuspectInfo[]
}

const ROLE_LABEL: Record<string, string> = {
  MAIN_SUSPECT: "Chủ mưu / Nghi phạm chính",
  ACCOMPLICE: "Đồng phạm",
  WITNESS: "Nhân chứng / Người liên quan",
}

const ROLE_CLS: Record<string, string> = {
  MAIN_SUSPECT: "text-red-500 bg-red-500/10 border-red-500/30",
  ACCOMPLICE: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  WITNESS: "text-blue-400 bg-blue-500/10 border-blue-500/30",
}

export default function CaseSuspectManager({ caseId, initialLinkedSuspects, allSuspects }: SuspectManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedSuspectId, setSelectedSuspectId] = useState("")
  const [selectedRole, setSelectedRole] = useState("MAIN_SUSPECT")
  const [linkedSuspects, setLinkedSuspects] = useState(initialLinkedSuspects)

  // Filter out suspects that are already linked to the case
  const linkedIds = new Set(linkedSuspects.map(l => l.suspect?.id))
  const unlinkedSuspects = allSuspects.filter(s => !linkedIds.has(s.id))

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSuspectId) return

    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, "caseSuspects"), {
        caseId,
        suspectId: selectedSuspectId,
        role: selectedRole,
        createdAt: new Date()
      })

      const suspect = allSuspects.find(s => s.id === selectedSuspectId)!

      setLinkedSuspects(prev => [...prev, {
        id: docRef.id,
        suspectId: selectedSuspectId,
        role: selectedRole,
        suspect
      }])
      setSelectedSuspectId("")
    } catch (error) {
      console.error(error)
      alert("Lỗi kết nối")
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async (linkId: string, suspectName: string) => {
    const confirmed = confirm(`Bạn có muốn gỡ bỏ đối tượng "${suspectName}" khỏi vụ án này không?`)
    if (!confirmed) return

    setLoading(true)
    try {
      await deleteDoc(doc(db, "caseSuspects", linkId))
      setLinkedSuspects(prev => prev.filter(l => l.id !== linkId))
    } catch (error) {
      console.error(error)
      alert("Lỗi kết nối")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Association Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Plus size={18} className="text-red-500" />
          Liên kết đối tượng mới
        </h3>
        
        {unlinkedSuspects.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">Mọi đối tượng trong hệ thống đều đã liên kết với vụ án này.</p>
        ) : (
          <form onSubmit={handleLink} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Chọn đối tượng hình sự</label>
              <select
                required
                value={selectedSuspectId}
                onChange={e => setSelectedSuspectId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="">-- Chọn đối tượng --</option>
                {unlinkedSuspects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} {s.aliases ? `(${s.aliases})` : ""} - CCCD: {s.idNumber || "Không rõ"}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-64">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Vai trò trong vụ án</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="MAIN_SUSPECT">Chủ mưu / Nghi phạm chính</option>
                <option value="ACCOMPLICE">Đồng phạm</option>
                <option value="WITNESS">Nhân chứng / Người liên quan</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSuspectId}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Plus size={16} />
              <span>Liên kết</span>
            </button>
          </form>
        )}
      </div>

      {/* Linked Suspects List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4 border-b border-zinc-800 pb-2">Danh sách đối tượng liên quan</h3>
        
        {linkedSuspects.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm bg-zinc-950 rounded-lg border border-zinc-800 border-dashed">
            <User size={32} className="mx-auto mb-2 opacity-50" />
            Chưa có đối tượng nào liên kết với vụ án này
          </div>
        ) : (
          <div className="space-y-3">
            {linkedSuspects.map(link => (
              <div key={link.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400">
                    <User size={20} />
                  </div>
                  <div>
                    <Link href={`/suspects/${link.suspect.id}`} className="font-semibold text-white hover:text-red-500 transition-colors text-sm">
                      {link.suspect.fullName}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {link.suspect.aliases && <span className="text-xs text-zinc-500">Bí danh: {link.suspect.aliases}</span>}
                      <span className="text-xs text-zinc-600">|</span>
                      <span className="text-xs text-zinc-500">CCCD: {link.suspect.idNumber || "Không rõ"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded border ${ROLE_CLS[link.role || ""] || "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                    {ROLE_LABEL[link.role || ""] || "Chưa xác định"}
                  </span>
                  
                  <button
                    onClick={() => handleUnlink(link.id, link.suspect.fullName)}
                    disabled={loading}
                    className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded border border-transparent hover:border-red-500/20 transition-colors"
                    title="Gỡ khỏi vụ án"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
