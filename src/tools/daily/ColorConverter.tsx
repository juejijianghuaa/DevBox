"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

// Helpers
function hexToRgb(hex: string) {
  let clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export default function ColorConverter() {
  const [hex, setHex] = useState("#3B82F6");
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateFromHex = (val: string) => {
    setHex(val);
    const parsed = hexToRgb(val);
    if (parsed) {
      setRgb(parsed);
      setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b));
    }
  };

  const copyVal = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  // Color shades
  const shades = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((lightness) => ({
    l: lightness,
    style: `hsl(${hsl.h}, ${hsl.s}%, ${lightness}%)`,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Color Preview & Native Picker */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div
            className="w-36 h-36 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center transition-colors"
            style={{ backgroundColor: hex }}
          />

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hex.startsWith("#") && hex.length === 7 ? hex : "#3B82F6"}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border border-slate-200 dark:border-slate-700 bg-white"
            />
            <span className="text-xs text-slate-500 font-medium">点击调色盘取色</span>
          </div>
        </div>

        {/* Formats Conversion */}
        <div className="lg:col-span-8 space-y-3">
          {/* HEX */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">HEX</span>
              <input
                type="text"
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="font-mono text-sm px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded uppercase outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              onClick={() => copyVal(hex, "hex")}
              className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "hex" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>复制</span>
            </button>
          </div>

          {/* RGB */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">RGB</span>
              <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </span>
            </div>
            <button
              onClick={() => copyVal(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "rgb")}
              className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "rgb" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>复制</span>
            </button>
          </div>

          {/* HSL */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono font-bold text-xs text-slate-600 dark:text-slate-400">HSL</span>
              <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
            </div>
            <button
              onClick={() => copyVal(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "hsl")}
              className="px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "hsl" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>复制</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shades Palette */}
      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          同色系明暗阶梯 (Lightness Shades)
        </label>
        <div className="grid grid-cols-9 gap-1.5 rounded-xl overflow-hidden p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
          {shades.map((s, idx) => (
            <div
              key={idx}
              onClick={() => copyVal(s.style, `shade-${idx}`)}
              className="h-14 rounded-lg flex items-end justify-center pb-1 text-[10px] font-mono cursor-pointer transition-transform hover:scale-105"
              style={{
                backgroundColor: s.style,
                color: s.l > 50 ? "#0f172a" : "#ffffff",
              }}
              title={`点击复制 ${s.style}`}
            >
              {s.l}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
