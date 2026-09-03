"use client";

import React, { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import { Copy, Check, Trash2, Minimize2, ArrowRightLeft, Sparkles, AlertCircle } from "lucide-react";

const SAMPLE_JSON = `{
  "name": "DevBox",
  "version": "1.0.0",
  "description": "纯前端极客工具箱",
  "features": [
    "零服务器成本",
    "数据不上云",
    "秒级静态响应",
    "深色模式支持"
  ],
  "author": {
    "name": "Developer",
    "github": "https://github.com"
  },
  "stats": {
    "toolsCount": 8,
    "active": true
  }
}`;

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<2 | 4 | "tab">(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Format
  const handleFormat = (indentVal: 2 | 4 | "tab" = indent) => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const space = indentVal === "tab" ? "\t" : indentVal;
      setOutput(JSON.stringify(parsed, null, space));
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "JSON 格式有误，请检查语法";
      setError(msg);
    }
  };

  // Minify
  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "JSON 格式有误，请检查语法";
      setError(msg);
    }
  };

  // Escape
  const handleEscape = () => {
    if (!input.trim()) return;
    try {
      setOutput(JSON.stringify(input));
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "转义失败";
      setError(msg);
    }
  };

  // Unescape
  const handleUnescape = () => {
    if (!input.trim()) return;
    try {
      const unescaped = JSON.parse(input);
      if (typeof unescaped === "string") {
        setOutput(unescaped);
      } else {
        setOutput(JSON.stringify(unescaped, null, 2));
      }
      setError(null);
    } catch {
      // Manual replace fallback
      setOutput(input.replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
      setError(null);
    }
  };

  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setIndent(2);
              handleFormat(2);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            格式化 (2 空格)
          </button>
          <button
            onClick={() => {
              setIndent(4);
              handleFormat(4);
            }}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            4 空格
          </button>
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            压缩紧凑
          </button>
          <button
            onClick={handleEscape}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            转义
          </button>
          <button
            onClick={handleUnescape}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            去除转义
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInput(SAMPLE_JSON)}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            填入示例
          </button>
          <button
            onClick={() => {
              setInput("");
              setOutput("");
              setError(null);
            }}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            title="清空内容"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-mono">{error}</div>
        </div>
      )}

      {/* Two Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>输入 JSON 文本</span>
            <span>{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="请在此粘贴或输入 JSON 字符串..."
            rows={18}
            className="w-full p-3.5 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y text-slate-800 dark:text-slate-100"
            spellCheck={false}
          />
        </div>

        {/* Right Output */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>处理结果</span>
            <div className="flex items-center gap-2">
              <span>{output.length} 字符</span>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "已复制" : "复制结果"}</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output || (input && !error ? "点击上方格式化按钮查看结果" : "")}
            placeholder="格式化结果将展示在这里..."
            rows={18}
            className="w-full p-3.5 font-mono text-xs sm:text-sm bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none resize-y text-slate-800 dark:text-slate-100"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
