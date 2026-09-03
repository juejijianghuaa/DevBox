"use client";

import React, { useState } from "react";
import { Copy, Check, Upload } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export default function Base64Codec() {
  const [tab, setTab] = useState<"base64" | "url" | "image">("base64");

  // Base64 Text
  const [b64Input, setB64Input] = useState("Hello, WebTools 极客工具箱!");
  const [b64Output, setB64Output] = useState("");
  const [b64Error, setB64Error] = useState<string | null>(null);

  // URL
  const [urlInput, setUrlInput] = useState("https://example.com/search?q=前端工具箱&lang=zh-CN");
  const [urlOutput, setUrlOutput] = useState("");

  // Image
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageSize, setImageSize] = useState(0);

  const [copied, setCopied] = useState(false);

  // Base64 UTF-8 Encode
  const handleB64Encode = () => {
    try {
      const bytes = new TextEncoder().encode(b64Input);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      setB64Output(btoa(binary));
      setB64Error(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "编码失败";
      setB64Error(msg);
    }
  };

  // Base64 UTF-8 Decode
  const handleB64Decode = () => {
    try {
      const binary = atob(b64Input.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      setB64Output(new TextDecoder().decode(bytes));
      setB64Error(null);
    } catch {
      setB64Error("Base64 解码失败，请确认输入的是合法的 Base64 字符串");
    }
  };

  // URL Encode
  const handleUrlEncode = () => {
    try {
      setUrlOutput(encodeURIComponent(urlInput));
    } catch (e: unknown) {
      setUrlOutput(e instanceof Error ? e.message : "编码失败");
    }
  };

  // URL Decode
  const handleUrlDecode = () => {
    try {
      setUrlOutput(decodeURIComponent(urlInput));
    } catch (e: unknown) {
      setUrlOutput(e instanceof Error ? e.message : "解码失败");
    }
  };

  // Handle Image Upload
  const handleImageUpload = (file: File) => {
    setImageFileName(file.name);
    setImageSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyText = async (text: string) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-sm font-medium">
        <button
          onClick={() => setTab("base64")}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            tab === "base64"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Base64 文本编解码
        </button>
        <button
          onClick={() => setTab("url")}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            tab === "url"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          URL 参数编解码
        </button>
        <button
          onClick={() => setTab("image")}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            tab === "image"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          图片转 Base64
        </button>
      </div>

      {/* Tab 1: Base64 */}
      {tab === "base64" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleB64Encode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs"
            >
              编码 (Encode)
            </button>
            <button
              onClick={handleB64Decode}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
            >
              解码 (Decode)
            </button>
          </div>

          {b64Error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 text-xs rounded-lg border border-red-200 dark:border-red-900">
              {b64Error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">输入内容</label>
              <textarea
                value={b64Input}
                onChange={(e) => setB64Input(e.target.value)}
                rows={10}
                placeholder="输入待编码或解码的文本..."
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-500">结果</label>
                {b64Output && (
                  <button
                    onClick={() => handleCopyText(b64Output)}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "已复制" : "复制"}</span>
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={b64Output}
                rows={10}
                placeholder="点击上方编码或解码按钮查看结果..."
                className="w-full p-3 font-mono text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: URL */}
      {tab === "url" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUrlEncode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              URL 编码 (encodeURIComponent)
            </button>
            <button
              onClick={handleUrlDecode}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
            >
              URL 解码 (decodeURIComponent)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">URL 原始链接 / 参数</label>
              <textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                rows={8}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-500">结果</label>
                {urlOutput && (
                  <button
                    onClick={() => handleCopyText(urlOutput)}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "已复制" : "复制"}</span>
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={urlOutput}
                rows={8}
                placeholder="点击上方编码或解码按钮查看结果..."
                className="w-full p-3 font-mono text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Image to Base64 */}
      {tab === "image" && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                handleImageUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/30"
            onClick={() => document.getElementById("img-upload")?.click()}
          >
            <input
              id="img-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              点击上传或直接拖拽图片到这里
            </p>
            <p className="text-xs text-slate-400 mt-1">支持 PNG, JPG, GIF, WebP, SVG 等格式</p>
          </div>

          {imageDataUrl && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-white flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageDataUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{imageFileName}</div>
                    <div className="text-[11px] text-slate-400">{(imageSize / 1024).toFixed(1)} KB</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyText(imageDataUrl)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>复制 Data URL (包含前缀)</span>
                  </button>
                  <button
                    onClick={() => handleCopyText(imageDataUrl.split(",")[1] || "")}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    仅复制 Base64 纯文本
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={imageDataUrl}
                rows={4}
                className="w-full p-2.5 font-mono text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-300"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
