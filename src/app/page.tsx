"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TOOLS, CATEGORIES } from "@/config/tools";
import { CategoryId, ToolMeta } from "@/types";
import { DynamicIcon } from "@/components/common/DynamicIcon";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  Search,
  Star,
  Clock,
  ShieldCheck,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useToolStats } from "@/hooks/useToolStats";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "favorites" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { favorites, toggleFavorite, isFavorite, mounted: favMounted } = useFavorites();
  const { recentTools } = useRecentTools();
  const { getToolStats, getTotalStats, mounted: statsMounted } = useToolStats();

  // Filter tools based on category and query
  const displayedTools = useMemo(() => {
    let list: ToolMeta[] = [];

    if (selectedCategory === "favorites") {
      list = TOOLS.filter((t) => favorites.includes(t.id));
    } else if (selectedCategory === "recent") {
      list = recentTools
        .map((id) => TOOLS.find((t) => t.id === id))
        .filter((t): t is ToolMeta => Boolean(t));
    } else if (selectedCategory === "all") {
      list = TOOLS;
    } else {
      list = TOOLS.filter((t) => t.category === selectedCategory);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((tool) => {
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchKw = tool.keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchDesc || matchKw;
    });
  }, [selectedCategory, searchQuery, favorites, recentTools]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>纯前端客户端运行 · 零数据上云 · 极致保护隐私</span>
          </div>

          {statsMounted && getTotalStats().grandTotal > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>今日打开 <strong className="font-semibold text-slate-900 dark:text-white">{getTotalStats().todayTotal}</strong> 次</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>历史打开 <strong className="font-semibold text-slate-900 dark:text-white">{getTotalStats().grandTotal}</strong> 次</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          开箱即用的{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            开发者极客工具箱
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          汇集格式化、加解密、时间计算、随机生成、文本对比等实用工具，秒开秒用无广告。
        </p>

        {/* Inline Search Bar */}
        <div className="pt-3 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索任何工具... (如: json, base64, 时间戳, 密码, 二维码)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-400 dark:hover:border-blue-500/50 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-slate-800">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <DynamicIcon name={cat.iconName} className="w-4 h-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}

        {/* Favorites Tab */}
        <button
          onClick={() => setSelectedCategory("favorites")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "favorites"
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
              : "bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>我的收藏 ({favMounted ? favorites.length : 0})</span>
        </button>

        {/* Recent Tab */}
        <button
          onClick={() => setSelectedCategory("recent")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "recent"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
              : "bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>最近使用</span>
        </button>
      </div>

      {/* Tools Grid */}
      <div>
        {displayedTools.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              未找到符合条件的工具
            </h3>
            <p className="text-xs text-slate-400">
              尝试清除筛选条件，或在顶部尝试搜索其他关键字
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {displayedTools.map((tool) => {
              const favorite = favMounted && isFavorite(tool.id);
              return (
                <div
                  key={tool.id}
                  className="group relative bg-white dark:bg-[#111726] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top: Icon & Actions */}
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 group-hover:scale-105 transition-transform">
                        <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {tool.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                            {tool.badge}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(tool.id);
                          }}
                          className="p-1 text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                          title={favorite ? "取消收藏" : "加入收藏"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              favorite ? "fill-amber-400 text-amber-400" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <Link href={`/tools/${tool.id}`} className="block group-hover:no-underline">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </Link>
                  </div>

                  {/* Bottom: Stats & Enter Link */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Activity className="w-3 h-3 text-blue-500/70 shrink-0" />
                      <span>今日 {statsMounted ? getToolStats(tool.id).todayCount : 0}</span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span>历史 {statsMounted ? getToolStats(tool.id).totalCount : 0}</span>
                    </div>
                    <Link
                      href={`/tools/${tool.id}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>打开使用</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
