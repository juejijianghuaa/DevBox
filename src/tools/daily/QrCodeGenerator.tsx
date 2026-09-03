"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check, QrCode as QrIcon } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://github.com");
  const [level, setLevel] = useState<ErrorCorrectionLevel>("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(2);
  const [dataUrl, setDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const renderQr = async () => {
      if (!text.trim()) {
        if (isSubscribed) setDataUrl("");
        return;
      }
      try {
        const url = await QRCode.toDataURL(text, {
          errorCorrectionLevel: level,
          margin: margin,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          width: 400,
        });
        if (isSubscribed) {
          setDataUrl(url);
        }
      } catch (err) {
        console.error(err);
      }
    };

    renderQr();

    return () => {
      isSubscribed = false;
    };
  }, [text, level, fgColor, bgColor, margin]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const copyDataUrl = async () => {
    if (!dataUrl) return;
    const ok = await copyToClipboard(dataUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Settings */}
      <div className="lg:col-span-7 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            二维码内容 (网址链接、文本、Wi-Fi 配置等)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="输入您希望生成二维码的内容..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Configurations */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                纠错等级 (越高越耐磨损/支持贴Logo)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ErrorCorrectionLevel)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="L">L - 约 7% 纠错</option>
                <option value="M">M - 约 15% 纠错 (推荐)</option>
                <option value="Q">Q - 约 25% 纠错</option>
                <option value="H">H - 约 30% 纠错 (最高)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                边距 (Margin): {margin} 格
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                前景色 (码点颜色)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                />
                <span className="font-mono text-slate-700 dark:text-slate-300 uppercase">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                背景色
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                />
                <span className="font-mono text-slate-700 dark:text-slate-300 uppercase">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800">
        <div className="w-56 h-56 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white p-3 shadow-md flex items-center justify-center">
          {dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={dataUrl} alt="QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-slate-400 text-xs">
              <QrIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              请输入内容以生成二维码
            </div>
          )}
        </div>

        {dataUrl && (
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={downloadPng}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              下载 PNG 图片
            </button>
            <button
              onClick={copyDataUrl}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制 Data URL" : "复制 Base64"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
