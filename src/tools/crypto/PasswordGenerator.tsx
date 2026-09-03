"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export default function PasswordGenerator() {
  const [tab, setTab] = useState<"password" | "uuid">("password");

  // Password Options
  const [pwdLength, setPwdLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [pwdCount, setPwdCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);

  // UUID Options
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuidNoHyphen, setUuidNoHyphen] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Generate Passwords
  const generatePasswords = useCallback(() => {
    let chars = "";
    if (includeUpper) chars += excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += excludeAmbiguous ? "abcdefghijkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += excludeAmbiguous ? "23456789" : "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      setPasswords(["请至少勾选一种字符类型"]);
      return;
    }

    const list: string[] = [];
    const array = new Uint32Array(pwdLength);

    for (let i = 0; i < pwdCount; i++) {
      if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(array);
        let pwd = "";
        for (let j = 0; j < pwdLength; j++) {
          pwd += chars[array[j] % chars.length];
        }
        list.push(pwd);
      } else {
        let pwd = "";
        for (let j = 0; j < pwdLength; j++) {
          pwd += chars[Math.floor(Math.random() * chars.length)];
        }
        list.push(pwd);
      }
    }
    setPasswords(list);
  }, [pwdLength, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, pwdCount]);

  // Generate UUIDs
  const generateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
      if (uuidNoHyphen) u = u.replace(/-/g, "");
      if (uuidUpper) u = u.toUpperCase();
      list.push(u);
    }
    setUuids(list);
  }, [uuidCount, uuidUpper, uuidNoHyphen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generatePasswords();
    }, 0);
    return () => clearTimeout(timer);
  }, [generatePasswords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateUuids();
    }, 0);
    return () => clearTimeout(timer);
  }, [generateUuids]);

  const copySingle = async (text: string, idx: number) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const copyAll = async (items: string[]) => {
    const ok = await copyToClipboard(items.join("\n"));
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    }
  };

  // Strength score
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { text: "弱", color: "bg-red-500", textCol: "text-red-500" };
    if (score <= 4) return { text: "良好", color: "bg-amber-500", textCol: "text-amber-500" };
    return { text: "极强", color: "bg-emerald-500", textCol: "text-emerald-500" };
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-sm font-medium">
        <button
          onClick={() => setTab("password")}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            tab === "password"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          安全强密码生成器
        </button>
        <button
          onClick={() => setTab("uuid")}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            tab === "uuid"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          UUID / GUID 批量生成
        </button>
      </div>

      {tab === "password" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
            {/* Length */}
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700 dark:text-slate-300">密码长度</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{pwdLength} 位</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={pwdLength}
                onChange={(e) => setPwdLength(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300 block">字符类型选择</span>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded text-blue-600"
                />
                大写字母 (A-Z)
              </label>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded text-blue-600"
                />
                小写字母 (a-z)
              </label>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded text-blue-600"
                />
                数字 (0-9)
              </label>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded text-blue-600"
                />
                特殊符号 (!@#$%^&*)
              </label>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer pt-1 border-t border-slate-200/40 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded text-blue-600"
                />
                排除易混淆字符 (0, O, 1, l, I)
              </label>
            </div>

            {/* Batch Count */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <label className="block text-slate-700 dark:text-slate-300 font-medium">生成条数</label>
              <select
                value={pwdCount}
                onChange={(e) => setPwdCount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="1">1 条</option>
                <option value="5">5 条</option>
                <option value="10">10 条</option>
                <option value="20">20 条</option>
              </select>
            </div>

            <button
              onClick={generatePasswords}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 重新生成
            </button>
          </div>

          {/* Results List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">生成结果</span>
              <button
                onClick={() => copyAll(passwords)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? "已复制全部" : "复制全部"}</span>
              </button>
            </div>

            <div className="space-y-2">
              {passwords.map((pwd, idx) => {
                const strength = getStrength(pwd);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 break-all select-all font-medium">
                        {pwd}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${strength.textCol} bg-slate-200/50 dark:bg-slate-800`}>
                        {strength.text}
                      </span>
                      <button
                        onClick={() => copySingle(pwd, idx)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="复制"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* UUID Generator */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">数量:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                >
                  <option value="1">1 个</option>
                  <option value="5">5 个</option>
                  <option value="10">10 个</option>
                  <option value="20">20 个</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUpper}
                  onChange={(e) => setUuidUpper(e.target.checked)}
                  className="rounded text-blue-600"
                />
                大写 (UPPERCASE)
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidNoHyphen}
                  onChange={(e) => setUuidNoHyphen(e.target.checked)}
                  className="rounded text-blue-600"
                />
                去除中划线连字符 (-)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generateUuids}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> 重新生成
              </button>
              <button
                onClick={() => copyAll(uuids)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                {copiedAll ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAll ? "已全部复制" : "复制全部"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {uuids.map((uuid, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <span className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all select-all">
                  {uuid}
                </span>
                <button
                  onClick={() => copySingle(uuid, idx)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded transition cursor-pointer shrink-0"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
