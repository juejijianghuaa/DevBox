"use client";

import React, { useState, useMemo } from "react";
import { copyToClipboard } from "@/lib/utils";
import {
  Copy,
  Check,
  Trash2,
  Minimize2,
  ArrowRightLeft,
  Sparkles,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ListTree,
  Code2,
  FoldHorizontal,
  UnfoldHorizontal,
} from "lucide-react";

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

// Helper: Collect all object/array container paths in JSON
function collectContainerPaths(data: unknown, prefix = "$"): string[] {
  if (data === null || typeof data !== "object") return [];
  const paths: string[] = [prefix];
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      paths.push(...collectContainerPaths(item, `${prefix}[${index}]`));
    });
  } else {
    Object.entries(data as Record<string, unknown>).forEach(([key, val]) => {
      paths.push(...collectContainerPaths(val, `${prefix}.${key}`));
    });
  }
  return paths;
}

// Tree Node Props
interface JsonTreeNodeProps {
  name?: string | number;
  value: unknown;
  path: string;
  isLast: boolean;
  collapsedPaths: Set<string>;
  onToggle: (path: string) => void;
}

// Interactive JSON Tree Node Component
function JsonTreeNode({
  name,
  value,
  path,
  isLast,
  collapsedPaths,
  onToggle,
}: JsonTreeNodeProps) {
  const [copiedVal, setCopiedVal] = useState(false);

  const handleCopyValue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    const ok = await copyToClipboard(str);
    if (ok) {
      setCopiedVal(true);
      setTimeout(() => setCopiedVal(false), 1500);
    }
  };

  // Render Primitives
  if (value === null) {
    return (
      <div className="group flex items-center py-0.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded px-1 -mx-1 font-mono text-xs">
        <span className="w-4 inline-block" />
        {name !== undefined && (
          <span className="text-blue-600 dark:text-blue-400 mr-1.5 font-medium">
            &quot;{name}&quot;:
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500 italic">null</span>
        {!isLast && <span className="text-slate-400">,</span>}
        <button
          onClick={handleCopyValue}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity"
          title="复制此值"
        >
          {copiedVal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="group flex items-center py-0.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded px-1 -mx-1 font-mono text-xs">
        <span className="w-4 inline-block" />
        {name !== undefined && (
          <span className="text-blue-600 dark:text-blue-400 mr-1.5 font-medium">
            &quot;{name}&quot;:
          </span>
        )}
        <span className="text-purple-600 dark:text-purple-400 font-semibold">
          {value ? "true" : "false"}
        </span>
        {!isLast && <span className="text-slate-400">,</span>}
        <button
          onClick={handleCopyValue}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity"
          title="复制此值"
        >
          {copiedVal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="group flex items-center py-0.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded px-1 -mx-1 font-mono text-xs">
        <span className="w-4 inline-block" />
        {name !== undefined && (
          <span className="text-blue-600 dark:text-blue-400 mr-1.5 font-medium">
            &quot;{name}&quot;:
          </span>
        )}
        <span className="text-amber-600 dark:text-amber-400 font-medium">{value}</span>
        {!isLast && <span className="text-slate-400">,</span>}
        <button
          onClick={handleCopyValue}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity"
          title="复制此值"
        >
          {copiedVal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div className="group flex items-center py-0.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded px-1 -mx-1 font-mono text-xs">
        <span className="w-4 inline-block" />
        {name !== undefined && (
          <span className="text-blue-600 dark:text-blue-400 mr-1.5 font-medium">
            &quot;{name}&quot;:
          </span>
        )}
        <span className="text-emerald-600 dark:text-emerald-400 break-all select-text">
          &quot;{value}&quot;
        </span>
        {!isLast && <span className="text-slate-400">,</span>}
        <button
          onClick={handleCopyValue}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity shrink-0"
          title="复制此值"
        >
          {copiedVal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  // Render Arrays
  if (Array.isArray(value)) {
    const isCollapsed = collapsedPaths.has(path);
    const count = value.length;

    return (
      <div className="font-mono text-xs">
        <div
          onClick={() => onToggle(path)}
          className="group flex items-center py-0.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded px-1 -mx-1 cursor-pointer select-none"
        >
          <span className="w-4 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors">
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>

          {name !== undefined && (
            <span className="text-blue-600 dark:text-blue-400 mr-1.5 font-medium">
              &quot;{name}&quot;:
            </span>
          )}

          {isCollapsed ? (
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold">[ ... ]</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-500 font-sans">
                {count} items
              </span>
              {!isLast && <span className="text-slate-400">,</span>}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500">
              <span className="font-bold">[</span>
              <span className="text-[10px] opacity-60 font-sans">({count})</span>
            </span>
          )}

          <button
            onClick={handleCopyValue}
            className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity"
            title="复制整个数组"
          >
            {copiedVal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="pl-3.5 ml-2 border-l border-slate-200/90 dark:border-slate-800/90 my-0.5">
              {value.map((item, idx) => (
                <JsonTreeNode
                  key={idx}
                  name={idx}
                  value={item}
                  path={`${path}[${idx}]`}
                  isLast={idx === value.length - 1}
                  collapsedPaths={collapsedPaths}
                  onToggle={onToggle}
                />
              ))}
            </div>
            <div className="pl-4 text-slate-500 font-mono text-xs">
              ]{!isLast && <span className="text-slate-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // Render Objects
  if (typeof value === "object") {
    const isCollapsed = collapsedPaths.has(path);
    const entries = Object.entries(value as Record<string, unknown>);
    const count = entries.length;

    return (
      <div className="font-mono text-xs">
        <div
          onClick={() => onToggle(path)}
          className="group flex items-center py-0.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded px-1 -mx-1 cursor-pointer select-none"
        >
          <span className="w-4 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors">
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>

          {name !== undefined && (
            <span className="text-blue-600 dark:text-blue-400 mr-1.5 font-medium">
              &quot;{name}&quot;:
            </span>
          )}

          {isCollapsed ? (
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-bold">&#123; ... &#125;</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-500 font-sans">
                {count} keys
              </span>
              {!isLast && <span className="text-slate-400">,</span>}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500">
              <span className="font-bold">&#123;</span>
              <span className="text-[10px] opacity-60 font-sans">({count})</span>
            </span>
          )}

          <button
            onClick={handleCopyValue}
            className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity"
            title="复制整个对象"
          >
            {copiedVal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="pl-3.5 ml-2 border-l border-slate-200/90 dark:border-slate-800/90 my-0.5">
              {entries.map(([childKey, childVal], idx) => (
                <JsonTreeNode
                  key={childKey}
                  name={childKey}
                  value={childVal}
                  path={`${path}.${childKey}`}
                  isLast={idx === entries.length - 1}
                  collapsedPaths={collapsedPaths}
                  onToggle={onToggle}
                />
              ))}
            </div>
            <div className="pl-4 text-slate-500 font-mono text-xs">
              &#125;{!isLast && <span className="text-slate-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // View Mode: 'tree' (default for intuitive folding) or 'text'
  const [viewMode, setViewMode] = useState<"tree" | "text">("tree");

  // Track collapsed paths in tree
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  // Parse JSON data for tree view
  const parsedJson = useMemo(() => {
    const raw = output || input;
    if (!raw.trim()) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [output, input]);

  // Format
  const handleFormat = (indentVal: 2 | 4 | "tab" = 2) => {
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
      setOutput(input.replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
      setError(null);
    }
  };

  // Copy
  const handleCopy = async () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Tree Toggle
  const togglePath = (path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Expand All
  const handleExpandAll = () => {
    setCollapsedPaths(new Set());
  };

  // Collapse All
  const handleCollapseAll = () => {
    if (parsedJson) {
      const allPaths = collectContainerPaths(parsedJson);
      setCollapsedPaths(new Set(allPaths));
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            格式化 (2 空格)
          </button>
          <button
            onClick={() => handleFormat(4)}
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
            onClick={() => {
              setInput(SAMPLE_JSON);
              setOutput("");
              setError(null);
            }}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">处理结果</span>

              {/* View Switcher: Tree vs Text */}
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    viewMode === "tree"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="树状视图：支持展开和折叠对象/数组"
                >
                  <ListTree className="w-3 h-3" />
                  <span>树状视图</span>
                </button>
                <button
                  onClick={() => setViewMode("text")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    viewMode === "text"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                  title="纯文本视图：方便直接全选与原生文本查看"
                >
                  <Code2 className="w-3 h-3" />
                  <span>纯文本</span>
                </button>
              </div>

              {/* Expand / Collapse All buttons (Tree Mode only) */}
              {viewMode === "tree" && parsedJson !== null && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleExpandAll}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="全部展开"
                  >
                    <UnfoldHorizontal className="w-3 h-3 text-blue-500" />
                    <span>展开</span>
                  </button>
                  <button
                    onClick={handleCollapseAll}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="全部折叠"
                  >
                    <FoldHorizontal className="w-3 h-3 text-amber-500" />
                    <span>折叠</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span>{(output || input).length} 字符</span>
              <button
                onClick={handleCopy}
                disabled={!output && !input}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "已复制" : "复制结果"}</span>
              </button>
            </div>
          </div>

          {/* View Mode Container */}
          {viewMode === "tree" ? (
            <div className="w-full min-h-[384px] max-h-[600px] overflow-auto p-4 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
              {parsedJson !== null ? (
                <div className="p-1">
                  <JsonTreeNode
                    value={parsedJson}
                    path="$"
                    isLast={true}
                    collapsedPaths={collapsedPaths}
                    onToggle={togglePath}
                  />
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <AlertCircle className="w-6 h-6 mb-2 opacity-60 text-amber-500" />
                  <span>当前内容不是合法的 JSON 格式，无法解析树状结构</span>
                  <span className="text-[11px] mt-1 text-slate-500">可切换到“纯文本”视图查看原始输出</span>
                </div>
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={output || (input && !error ? "点击上方格式化按钮查看结果" : "")}
              placeholder="格式化结果将展示在这里..."
              rows={18}
              className="w-full p-3.5 font-mono text-xs sm:text-sm bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none resize-y text-slate-800 dark:text-slate-100"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
