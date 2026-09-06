"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ToolMeta } from "@/types";
import { DynamicIcon } from "./DynamicIcon";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  Star,
  Share2,
  ShieldCheck,
  Check,
  ArrowLeft,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { TOOLS } from "@/config/tools";

interface ToolContainerProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

export function ToolContainer({ tool, children }: ToolContainerProps) {
  const { isFavorite, toggleFavorite, mounted: favMounted } = useFavorites();
  const { addRecentTool } = useRecentTools();
  const [copied, setCopied] = useState(false);

  const ribbonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    addRecentTool(tool.id);
  }, [tool.id, addRecentTool]);

  // Support fast mouse wheel horizontal scrolling when hovered over the quick ribbon
  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 2.5;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Ensure active tool is visible when loaded
  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return;
    const active = el.querySelector("[data-active='true']");
    if (active) {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [tool.id]);

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const favorite = favMounted ? isFavorite(tool.id) : false;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar: Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link
              href="/"
              className="hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 返回工具库
            </Link>
            <span>/</span>
            <span>{tool.name}</span>
          </div>

          {/* Title & Icon */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <DynamicIcon name={tool.iconName} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {tool.name}
                </h1>
                {tool.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium border border-blue-500/20">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {tool.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Privacy badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>纯本地计算 · 零数据上云</span>
          </div>

          {/* Favorite button */}
          <button
            onClick={() => toggleFavorite(tool.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              favorite
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
            title={favorite ? "已收藏" : "加入收藏"}
          >
            <Star
              className={`w-3.5 h-3.5 ${favorite ? "fill-amber-400 text-amber-500" : ""}`}
            />
            <span>{favorite ? "已收藏" : "收藏"}</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            title="复制此工具链接"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">已复制链接</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>分享</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Switch Ribbon: Direct jump to any other tool with 1 click & fast mouse wheel scroll */}
      <div
        ref={ribbonRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs"
      >
        {TOOLS.map((t) => {
          const isActive = t.id === tool.id;
          return (
            <Link
              key={t.id}
              href={`/tools/${t.id}`}
              data-active={isActive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20"
                  : "bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/80"
              }`}
            >
              <DynamicIcon name={t.iconName} className="w-3.5 h-3.5 shrink-0" />
              <span>{t.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Tool Interactive Body */}
      <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
