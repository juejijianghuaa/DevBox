"use client";

import React, { useState } from "react";

const SAMPLE_OLD = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

const SAMPLE_NEW = `function calculateTotal(items) {
  // Use reduce for cleaner code
  return items.reduce((acc, cur) => {
    return acc + (cur.price || 0);
  }, 0);
}`;

type DiffLine = {
  type: "added" | "removed" | "same";
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
};

// Simple Myers-like or LCS diff for lines
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      diff.push({
        type: "same",
        content: oldLines[i],
        oldLineNum: i + 1,
        newLineNum: j + 1,
      });
      i++;
      j++;
    } else {
      // Lookahead to see if next lines match
      const oldRemaining = oldLines.slice(i);
      const newRemaining = newLines.slice(j);

      const nextOldInNew = newRemaining.indexOf(oldLines[i]);
      const nextNewInOld = oldRemaining.indexOf(newLines[j]);

      if (i < oldLines.length && (nextNewInOld === -1 || nextOldInNew > nextNewInOld)) {
        diff.push({
          type: "removed",
          content: oldLines[i],
          oldLineNum: i + 1,
        });
        i++;
      } else if (j < newLines.length) {
        diff.push({
          type: "added",
          content: newLines[j],
          newLineNum: j + 1,
        });
        j++;
      } else if (i < oldLines.length) {
        diff.push({
          type: "removed",
          content: oldLines[i],
          oldLineNum: i + 1,
        });
        i++;
      }
    }
  }

  return diff;
}

export default function TextDiff() {
  const [oldText, setOldText] = useState(SAMPLE_OLD);
  const [newText, setNewText] = useState(SAMPLE_NEW);

  const diffLines = computeDiff(oldText, newText);

  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">对比统计：</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{addedCount} 行新增</span>
          <span className="text-rose-600 dark:text-rose-400 font-medium">-{removedCount} 行删除</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOldText(SAMPLE_OLD);
              setNewText(SAMPLE_NEW);
            }}
            className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 cursor-pointer"
          >
            载入示例
          </button>
          <button
            onClick={() => {
              setOldText("");
              setNewText("");
            }}
            className="px-2.5 py-1 text-slate-400 hover:text-red-500 cursor-pointer"
          >
            清空内容
          </button>
        </div>
      </div>

      {/* Two Text Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            原文本 (Original)
          </label>
          <textarea
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            rows={10}
            placeholder="粘贴旧文本..."
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            修改后文本 (Modified)
          </label>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={10}
            placeholder="粘贴新文本..."
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff Result Viewer */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          差异高亮对比视图
        </label>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-mono text-xs bg-slate-50 dark:bg-slate-950/60">
          {diffLines.length === 0 ? (
            <div className="p-8 text-center text-slate-400">两段文本完全一致，无任何变动</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-900/60">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-stretch px-3 py-1 ${
                    line.type === "added"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : line.type === "removed"
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/30"
                  }`}
                >
                  <div className="w-8 select-none text-right pr-2 text-[11px] text-slate-400 shrink-0 border-r border-slate-200 dark:border-slate-800 mr-2">
                    {line.oldLineNum || ""}
                  </div>
                  <div className="w-8 select-none text-right pr-2 text-[11px] text-slate-400 shrink-0 border-r border-slate-200 dark:border-slate-800 mr-2">
                    {line.newLineNum || ""}
                  </div>
                  <div className="w-4 select-none font-bold shrink-0">
                    {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap break-all">{line.content || " "}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
