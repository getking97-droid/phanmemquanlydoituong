"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, FolderOpen, PieChart, Search } from "lucide-react";
import { LogoutButton } from "./logout-button";
import PoliceLogo from "@/components/ui/police-logo";
import { useAuth } from "@/components/providers/session-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <PoliceLogo className="w-8 h-8 mr-3 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
          <h1 className="font-bold text-base tracking-wider text-red-500">ĐỘI 2 - PC02</h1>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-red-500">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.email?.split("@")[0]}</span>
              <span className="text-xs text-zinc-500">VIEWER</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-red-600/10 text-red-500 font-medium transition-colors">
            <PieChart size={20} />
            <span>Tổng quan</span>
          </Link>
          <Link href="/suspects" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Users size={20} />
            <span>Đối tượng Hình sự</span>
          </Link>
          <Link href="/cases" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <FolderOpen size={20} />
            <span>Hồ sơ Vụ án</span>
          </Link>
          <Link href="/search" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Search size={20} />
            <span>Tra cứu</span>
          </Link>
          <Link href="/map" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
            <span>Bản đồ đối tượng</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <h2 className="text-lg font-medium text-zinc-300">Phần mềm quản lý đối tượng hình sự Đội 2-PC02 Khánh Hòa</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-500">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
