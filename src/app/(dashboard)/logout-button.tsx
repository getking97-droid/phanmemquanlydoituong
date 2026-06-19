"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
    >
      <LogOut size={20} />
      <span>Đăng xuất</span>
    </button>
  );
}
