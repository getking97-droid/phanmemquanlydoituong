"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PoliceLogo from "@/components/ui/police-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Thông tin đăng nhập không chính xác");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 mb-4 flex items-center justify-center">
            <PoliceLogo className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
          </div>
          <h1 className="text-2xl font-bold text-center text-white leading-tight">Phần mềm quản lý đối tượng hình sự</h1>
          <h2 className="text-lg font-bold text-center text-red-500 mt-1">Đội 2-PC02 Khánh Hòa</h2>
          <p className="text-zinc-400 text-sm mt-3">Đăng nhập bằng tài khoản cấp phát</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-600/20"
          >
            Đăng nhập hệ thống
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-zinc-500">
          <p>Dành riêng cho Lực lượng Chức năng.</p>
          <p>Mọi hành vi truy cập trái phép sẽ bị xử lý.</p>
        </div>
      </div>
    </div>
  );
}
