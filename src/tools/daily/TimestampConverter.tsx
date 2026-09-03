"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Play, Pause, Calendar, Clock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

function formatDate(d: Date): string {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

interface TsResult {
  local: string;
  utc: string;
  iso: string;
  ms: number;
  s: number;
}

export default function TimestampConverter() {
  const [currentSec, setCurrentSec] = useState(() => Math.floor(Date.now() / 1000));
  const [currentMs, setCurrentMs] = useState(() => Date.now());
  const [isLive, setIsLive] = useState(true);

  // Convert 1: Timestamp to Date
  const [inputTs, setInputTs] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [tsUnit, setTsUnit] = useState<"s" | "ms">("s");
  const [tsResult, setTsResult] = useState<TsResult | null>(() => {
    const d = new Date();
    return {
      local: formatDate(d),
      utc: d.toUTCString(),
      iso: d.toISOString(),
      ms: d.getTime(),
      s: Math.floor(d.getTime() / 1000),
    };
  });

  // Convert 2: Date to Timestamp
  const [inputDate, setInputDate] = useState(() => formatDate(new Date()));
  const [dateResult, setDateResult] = useState<{ s: number; ms: number } | null>(() => {
    const d = new Date();
    return {
      ms: d.getTime(),
      s: Math.floor(d.getTime() / 1000),
    };
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live timer
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentMs(now);
      setCurrentSec(Math.floor(now / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Handle Timestamp -> Date
  const handleConvertTs = (val: string, unit: "s" | "ms") => {
    setInputTs(val);
    const num = Number(val.trim());
    if (!val.trim() || isNaN(num)) {
      setTsResult(null);
      return;
    }
    const ms = unit === "s" ? num * 1000 : num;
    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      setTsResult(null);
      return;
    }
    setTsResult({
      local: formatDate(d),
      utc: d.toUTCString(),
      iso: d.toISOString(),
      ms: ms,
      s: Math.floor(ms / 1000),
    });
  };

  // Handle Date -> Timestamp
  const handleConvertDate = (val: string) => {
    setInputDate(val);
    if (!val.trim()) {
      setDateResult(null);
      return;
    }
    const d = new Date(val.trim().replace(/-/g, "/"));
    if (isNaN(d.getTime())) {
      setDateResult(null);
      return;
    }
    setDateResult({
      ms: d.getTime(),
      s: Math.floor(d.getTime() / 1000),
    });
  };

  const copyVal = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Real-time Ticker Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              当前实时时间戳
            </span>
            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-800 dark:text-slate-100">
                  {currentSec}
                </span>
                <span className="text-xs text-slate-500 font-medium">(秒)</span>
                <button
                  onClick={() => copyVal(currentSec.toString(), "currSec")}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="复制秒级时间戳"
                >
                  {copiedKey === "currSec" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-medium text-slate-600 dark:text-slate-300">
                  {currentMs}
                </span>
                <span className="text-xs text-slate-500 font-medium">(毫秒)</span>
                <button
                  onClick={() => copyVal(currentMs.toString(), "currMs")}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
                  title="复制毫秒级时间戳"
                >
                  {copiedKey === "currMs" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              本地时间：{currentMs ? formatDate(new Date(currentMs)) : ""}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {isLive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-500" /> 暂停计时
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500" /> 恢复计时
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Converter 1: Timestamp to Date */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            时间戳 转 北京/本地时间
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputTs}
              onChange={(e) => handleConvertTs(e.target.value, tsUnit)}
              placeholder="请输入时间戳，如 1772549200"
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />
            <select
              value={tsUnit}
              onChange={(e) => {
                const u = e.target.value as "s" | "ms";
                setTsUnit(u);
                handleConvertTs(inputTs, u);
              }}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="s">秒 (s)</option>
              <option value="ms">毫秒 (ms)</option>
            </select>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => handleConvertTs(currentSec.toString(), "s")}
              className="px-2 py-1 text-xs bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              设为当前时间
            </button>
            <button
              onClick={() => {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                handleConvertTs(Math.floor(now.getTime() / 1000).toString(), "s");
              }}
              className="px-2 py-1 text-xs bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              今日 00:00:00
            </button>
          </div>

          {/* Results */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500">本地格式化时间</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {tsResult ? tsResult.local : "-"}
                </span>
                {tsResult && (
                  <button
                    onClick={() => copyVal(tsResult.local, "tsLocal")}
                    className="cursor-pointer"
                  >
                    {copiedKey === "tsLocal" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500">ISO 8601 (UTC)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {tsResult ? tsResult.iso : "-"}
                </span>
                {tsResult && (
                  <button
                    onClick={() => copyVal(tsResult.iso, "tsIso")}
                    className="cursor-pointer"
                  >
                    {copiedKey === "tsIso" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Converter 2: Date to Timestamp */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            时间 转 时间戳
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputDate}
              onChange={(e) => handleConvertDate(e.target.value)}
              placeholder="如 2026-09-03 22:30:00"
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => handleConvertDate(formatDate(new Date()))}
              className="px-2 py-1 text-xs bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              填充当前时间
            </button>
          </div>

          {/* Results */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500">秒 (Seconds)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {dateResult ? dateResult.s : "-"}
                </span>
                {dateResult && (
                  <button
                    onClick={() => copyVal(dateResult.s.toString(), "dateSec")}
                    className="cursor-pointer"
                  >
                    {copiedKey === "dateSec" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500">毫秒 (Milliseconds)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {dateResult ? dateResult.ms : "-"}
                </span>
                {dateResult && (
                  <button
                    onClick={() => copyVal(dateResult.ms.toString(), "dateMs")}
                    className="cursor-pointer"
                  >
                    {copiedKey === "dateMs" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
