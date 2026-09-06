"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  FileUp,
  File,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  X,
  Search,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

// Pure JS MD5 algorithm for Uint8Array
function md5Bytes(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const n = bytes.length;
  const nBlocks = ((n + 8) >> 6) + 1;
  const words = new Int32Array(nBlocks * 16);
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[nBlocks * 16 - 2] = (n * 8) & 0xffffffff;
  words[nBlocks * 16 - 1] = Math.floor((n * 8) / 0x100000000);

  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a,
      oldb = b,
      oldc = c,
      oldd = d;

    a = ff(a, b, c, d, words[i + 0], 7, -680876936);
    d = ff(d, a, b, c, words[i + 1], 12, -389564586);
    c = ff(c, d, a, b, words[i + 2], 17, 606105819);
    b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4], 7, -176418897);
    d = ff(d, a, b, c, words[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = ff(a, b, c, d, words[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10], 17, -42063);
    b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13], 12, -40341101);
    c = ff(c, d, a, b, words[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15], 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1], 5, -165796510);
    d = gg(d, a, b, c, words[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11], 14, 643717713);
    b = gg(b, c, d, a, words[i + 0], 20, -373897302);
    a = gg(a, b, c, d, words[i + 5], 5, -701558691);
    d = gg(d, a, b, c, words[i + 10], 9, 38016083);
    c = gg(c, d, a, b, words[i + 15], 14, -660478335);
    b = gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = gg(a, b, c, d, words[i + 9], 5, 568446438);
    d = gg(d, a, b, c, words[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3], 14, -187363961);
    b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2], 9, -51403784);
    c = gg(c, d, a, b, words[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12], 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5], 4, -378558);
    d = hh(d, a, b, c, words[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = hh(a, b, c, d, words[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7], 16, -155497632);
    b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13], 4, 681279174);
    d = hh(d, a, b, c, words[i + 0], 11, -358537222);
    c = hh(c, d, a, b, words[i + 3], 16, -722521979);
    b = hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = hh(a, b, c, d, words[i + 9], 4, -640364487);
    d = hh(d, a, b, c, words[i + 12], 11, -421815835);
    c = hh(c, d, a, b, words[i + 15], 16, 530742520);
    b = hh(b, c, d, a, words[i + 2], 23, -995338651);

    a = ii(a, b, c, d, words[i + 0], 6, -198630844);
    d = ii(d, a, b, c, words[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = ii(a, b, c, d, words[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10], 15, -1051523);
    b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15], 10, -30611744);
    c = ii(c, d, a, b, words[i + 6], 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4], 6, -145523070);
    d = ii(d, a, b, c, words[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2], 15, 718787259);
    b = ii(b, c, d, a, words[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexDigits = "0123456789abcdef";
  let output = "";
  const arr = [a, b, c, d];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      output +=
        hexDigits.charAt((arr[i] >> (j * 8 + 4)) & 0x0f) +
        hexDigits.charAt((arr[i] >> (j * 8)) & 0x0f);
    }
  }
  return output;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function HashGenerator() {
  // Mode: 'text' | 'file'
  const [mode, setMode] = useState<"text" | "file">("text");

  // Text Mode State
  const [textInput, setTextInput] = useState("Hello, World!");

  // File Mode State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // General Settings
  const [uppercase, setUppercase] = useState(false);
  const [compareHash, setCompareHash] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Text Hashes State
  const [textHashes, setTextHashes] = useState<Record<string, string>>({
    MD5: "",
    "SHA-1": "",
    "SHA-256": "",
    "SHA-512": "",
  });

  // File Hashes State
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({
    MD5: "",
    "SHA-1": "",
    "SHA-256": "",
    "SHA-512": "",
  });

  // Calculate Text Hash in Real-time
  useEffect(() => {
    async function calculateText() {
      if (!textInput) {
        setTextHashes({ MD5: "", "SHA-1": "", "SHA-256": "", "SHA-512": "" });
        return;
      }
      const enc = new TextEncoder().encode(textInput);
      const md5Val = md5Bytes(enc);

      const sha1Buf = await crypto.subtle.digest("SHA-1", enc);
      const sha256Buf = await crypto.subtle.digest("SHA-256", enc);
      const sha512Buf = await crypto.subtle.digest("SHA-512", enc);

      const bufToHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      setTextHashes({
        MD5: md5Val,
        "SHA-1": bufToHex(sha1Buf),
        "SHA-256": bufToHex(sha256Buf),
        "SHA-512": bufToHex(sha512Buf),
      });
    }

    calculateText();
  }, [textInput]);

  // Handle File Upload & Hash Calculation
  const handleProcessFile = async (file: File) => {
    setSelectedFile(file);
    setIsCalculating(true);
    setFileHashes({ MD5: "", "SHA-1": "", "SHA-256": "", "SHA-512": "" });

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // 1. MD5
      const md5Val = md5Bytes(bytes);

      // 2. Web Crypto SHA
      const sha1Buf = await crypto.subtle.digest("SHA-1", buffer);
      const sha256Buf = await crypto.subtle.digest("SHA-256", buffer);
      const sha512Buf = await crypto.subtle.digest("SHA-512", buffer);

      const bufToHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      setFileHashes({
        MD5: md5Val,
        "SHA-1": bufToHex(sha1Buf),
        "SHA-256": bufToHex(sha256Buf),
        "SHA-512": bufToHex(sha512Buf),
      });
    } catch (err) {
      console.error("File hash calculation failed:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Active Hashes based on mode
  const activeHashes = mode === "text" ? textHashes : fileHashes;

  // Comparison Match Result
  const cleaned = compareHash.trim().toLowerCase();
  let matchResult: { matched: boolean; algo: string | null } | null = null;
  if (cleaned) {
    let found = false;
    for (const [algo, value] of Object.entries(activeHashes)) {
      if (value && value.toLowerCase() === cleaned) {
        matchResult = { matched: true, algo };
        found = true;
        break;
      }
    }
    if (!found) {
      matchResult = { matched: false, algo: null };
    }
  }

  const copyVal = async (text: string, key: string) => {
    const formatted = uppercase ? text.toUpperCase() : text.toLowerCase();
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-800">
          <button
            onClick={() => setMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "text"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📝 文本哈希</span>
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "file"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>📁 文件哈希校验</span>
          </button>
        </div>

        <div className="flex items-center gap-4 px-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>大写输出 (Uppercase)</span>
          </label>
        </div>
      </div>

      {/* Mode 1: Text Input */}
      {mode === "text" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>输入文本内容</span>
            <span className="text-slate-400 font-normal">{textInput.length} 字符</span>
          </div>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            placeholder="在此输入需要计算哈希的任意文本..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 transition-all"
          />
        </div>
      )}

      {/* Mode 2: File Upload & Drag-and-Drop */}
      {mode === "file" && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleProcessFile(file);
            }}
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
                  : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/60 dark:hover:bg-slate-900/30"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  点击选择文件，或将本地文件直接拖拽到此处
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  支持任意格式（.zip、.exe、.iso、.pdf、.png等），纯浏览器本地高速计算，100% 隐私安全
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <File className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-md">
                    {selectedFile.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span>·</span>
                    <span>{selectedFile.type || "未知类型"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  更换文件
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFileHashes({ MD5: "", "SHA-1": "", "SHA-256": "", "SHA-512": "" });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                  title="移除文件"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {isCalculating && (
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-700 dark:text-blue-300 animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>正在计算文件哈希值（纯前端硬件加速，请稍候...）</span>
            </div>
          )}
        </div>
      )}

      {/* Comparison Tool (比对校验值) */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            <span>哈希比对校验 (可选：粘贴官方或预期的哈希值验证文件完整性)</span>
          </label>
          {compareHash && (
            <button
              onClick={() => setCompareHash("")}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              清空比对
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={compareHash}
            onChange={(e) => setCompareHash(e.target.value)}
            placeholder="粘贴待比对的 MD5 / SHA-1 / SHA-256 / SHA-512 值进行自动验证..."
            className="w-full pl-3 pr-24 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 dark:text-slate-100"
          />

          {compareHash && (
            <div className="absolute right-2.5 flex items-center">
              {matchResult?.matched ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>匹配成功 ({matchResult.algo})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  <XCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>未匹配</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hashes Output List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 tracking-wide uppercase">
          <span>{mode === "file" ? "文件哈希计算结果" : "文本哈希计算结果"}</span>
          <span className="text-[11px] text-slate-400 font-normal">支持直接全选复制</span>
        </div>

        {Object.entries(activeHashes).map(([algo, value]) => {
          const displayVal = value ? (uppercase ? value.toUpperCase() : value.toLowerCase()) : "-";
          const isMatched =
            matchResult?.matched && matchResult.algo === algo;

          return (
            <div
              key={algo}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                isMatched
                  ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-20 shrink-0 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {algo}
                  </span>
                  {isMatched && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </div>
                <span className="text-xs font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                  {displayVal}
                </span>
              </div>

              {value && (
                <button
                  onClick={() => copyVal(value, algo)}
                  className={`self-end sm:self-auto px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 cursor-pointer shrink-0 transition-colors ${
                    isMatched
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {copiedKey === algo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          所有哈希计算均在用户本地浏览器的 Web Crypto 与内存中完成，文件永不上传服务器，完全保障数据安全。
        </span>
      </div>
    </div>
  );
}
