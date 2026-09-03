"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { SearchModal } from "../common/SearchModal";
import { ShieldCheck } from "lucide-react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#0d121f]/50 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">DevBox</span>
            <span>· 纯前端极客实用小工具合集</span>
          </div>

          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>所有计算均在用户本地浏览器完成 · 100% 隐私保护</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Built with Next.js & Tailwind CSS</span>
          </div>
        </div>
      </footer>

      {/* Global Command/Search Palette */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
