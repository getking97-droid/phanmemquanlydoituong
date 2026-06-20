"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut(auth)}
      className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
    >
      <LogOut size={20} />
      <span>Đăng xuất</span>
    </button>
  );
}
