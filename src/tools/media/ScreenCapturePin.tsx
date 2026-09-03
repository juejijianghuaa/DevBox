"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Pin,
  Copy,
  Download,
  Square,
  MoveRight,
  Pencil,
  EyeOff,
  RotateCcw,
  Check,
  X,
  Layers,
  Upload,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type ToolMode = "select" | "rect" | "arrow" | "brush" | "mosaic";

export default function ScreenCapturePin() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolMode>("select");
  const [strokeColor, setStrokeColor] = useState("#EF4444"); // Red default
  const [history, setHistory] = useState<ImageData[]>([]);
  const [copied, setCopied] = useState(false);

  // In-Page Pin State
  const [isPinned, setIsPinned] = useState(false);
  const [pinPos, setPinPos] = useState({ x: 40, y: 100 });
  const [pinScale, setPinScale] = useState(1);
  const [pinOpacity, setPinOpacity] = useState(0.95);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pinnedImageSrc, setPinnedImageSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotData = useRef<ImageData | null>(null);

  // 1. Native Screen Capture API
  const handleCaptureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as MediaTrackConstraints,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setImageSrc(dataUrl);
      }

      // Stop media tracks
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.warn("Screen capture cancelled or failed:", err);
    }
  };

  // 2. Paste from clipboard (Ctrl + V)
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setImageSrc(event.target.result as string);
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // 3. Load image into canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Save current canvas state
  const saveSnapshot = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      snapshotData.current = ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  };

  // Canvas Mouse Events for Annotations
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "select") return;
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    startPos.current = pos;
    saveSnapshot();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && currentTool === "brush") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);

    if (currentTool === "rect") {
      if (snapshotData.current) {
        ctx.putImageData(snapshotData.current, 0, 0);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(
        startPos.current.x,
        startPos.current.y,
        pos.x - startPos.current.x,
        pos.y - startPos.current.y
      );
    } else if (currentTool === "arrow") {
      if (snapshotData.current) {
        ctx.putImageData(snapshotData.current, 0, 0);
      }
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.lineWidth = 4;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(startPos.current.x, startPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(
        pos.y - startPos.current.y,
        pos.x - startPos.current.x
      );
      const headlen = 16;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(
        pos.x - headlen * Math.cos(angle - Math.PI / 6),
        pos.y - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        pos.x - headlen * Math.cos(angle + Math.PI / 6),
        pos.y - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    } else if (currentTool === "brush") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (currentTool === "mosaic") {
      // Simple pixelated mosaic block
      const size = 16;
      const x = Math.floor(pos.x / size) * size;
      const y = Math.floor(pos.y / size) * size;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      ctx.fillRect(x, y, size, size);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !canvasRef.current) return;
    isDrawing.current = false;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      setHistory((prev) => [
        ...prev,
        ctx.getImageData(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        ),
      ]);
    }
  };

  // Undo
  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    const newHistory = history.slice(0, -1);
    const prevData = newHistory[newHistory.length - 1];
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.putImageData(prevData, 0, 0);
      setHistory(newHistory);
    }
  };

  // 4. Desktop Picture-in-Picture Pin (OS level always on top!)
  const handleDesktopPiP = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const currentDataUrl = canvas.toDataURL("image/png");

    // Check modern Document Picture-in-Picture API
    if ("documentPictureInPicture" in window) {
      try {
        const pipWindow = await (
          window as unknown as {
            documentPictureInPicture: {
              requestWindow: (options: {
                width: number;
                height: number;
              }) => Promise<Window>;
            };
          }
        ).documentPictureInPicture.requestWindow({
          width: Math.min(canvas.width, 900),
          height: Math.min(canvas.height, 600),
        });

        // Set up pinned window document
        pipWindow.document.title = "📌 贴图置顶 (DevBox)";
        pipWindow.document.body.style.margin = "0";
        pipWindow.document.body.style.padding = "0";
        pipWindow.document.body.style.backgroundColor = "#000000";
        pipWindow.document.body.style.display = "flex";
        pipWindow.document.body.style.alignItems = "center";
        pipWindow.document.body.style.justifyContent = "center";
        pipWindow.document.body.style.overflow = "hidden";

        const img = pipWindow.document.createElement("img");
        img.src = currentDataUrl;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.style.objectFit = "contain";
        img.style.userSelect = "none";
        pipWindow.document.body.appendChild(img);
        return;
      } catch (e) {
        console.warn("Document PiP request failed, falling back:", e);
      }
    }

    // Fallback: In-page pin
    setIsPinned(true);
  };

  // 5. In-Page Pin Drag Handlers
  const startDragPin = (e: React.MouseEvent) => {
    setIsDraggingPin(true);
    setDragOffset({
      x: e.clientX - pinPos.x,
      y: e.clientY - pinPos.y,
    });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingPin) return;
      setPinPos({
        x: Math.max(10, e.clientX - dragOffset.x),
        y: Math.max(10, e.clientY - dragOffset.y),
      });
    };
    const onMouseUp = () => setIsDraggingPin(false);

    if (isDraggingPin) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDraggingPin, dragOffset]);

  const handleTogglePin = () => {
    if (!isPinned) {
      if (canvasRef.current) {
        setPinnedImageSrc(canvasRef.current.toDataURL("image/png"));
      } else {
        setPinnedImageSrc(imageSrc);
      }
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // fallback data url
          await copyToClipboard(canvasRef.current?.toDataURL("image/png") || "");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch {
      // fallback
    }
  };

  // Download PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `screenshot_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-5">
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCaptureScreen}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Camera className="w-4 h-4" />
            <span>开始截屏 (捕获屏幕/窗口)</span>
          </button>

          <label
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="选择本地图片"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>导入图片</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) setImageSrc(ev.target.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>

          <span className="text-[11px] text-slate-400 hidden sm:inline-block px-1">
            支持直接按 <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">Ctrl + V</kbd> 粘贴剪贴板截图
          </span>
        </div>

        {imageSrc && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Desktop PiP Pin Button */}
            <button
              onClick={handleDesktopPiP}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
              title="类似 Snipaste F3，置顶在所有系统软件最前端"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>🖥️ 桌面置顶贴图</span>
            </button>

            {/* In-Page Pin Button */}
            <button
              onClick={handleTogglePin}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isPinned
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-600 dark:text-blue-400"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isPinned ? "已网页贴图" : "网页内钉住"}</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制" : "复制图片"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 PNG</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor & Canvas Area */}
      {imageSrc ? (
        <div className="space-y-3">
          {/* Annotation Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 mr-1">标注工具：</span>
              <button
                onClick={() => setCurrentTool("select")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  currentTool === "select"
                    ? "bg-white dark:bg-slate-800 shadow-xs font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                查看 / 拖拽
              </button>

              <button
                onClick={() => setCurrentTool("rect")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  currentTool === "rect"
                    ? "bg-white dark:bg-slate-800 shadow-xs font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Square className="w-3.5 h-3.5" /> 矩形框
              </button>

              <button
                onClick={() => setCurrentTool("arrow")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  currentTool === "arrow"
                    ? "bg-white dark:bg-slate-800 shadow-xs font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <MoveRight className="w-3.5 h-3.5" /> 箭头
              </button>

              <button
                onClick={() => setCurrentTool("brush")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  currentTool === "brush"
                    ? "bg-white dark:bg-slate-800 shadow-xs font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" /> 画笔涂鸦
              </button>

              <button
                onClick={() => setCurrentTool("mosaic")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  currentTool === "mosaic"
                    ? "bg-white dark:bg-slate-800 shadow-xs font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" /> 马赛克
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Color picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">颜色:</span>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 bg-white p-0"
                />
              </div>

              {/* Undo */}
              <button
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="px-2 py-1 rounded text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                title="撤销上一步"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>撤销</span>
              </button>
            </div>
          </div>

          {/* Canvas viewport */}
          <div className="overflow-auto max-h-[680px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-black/40 p-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-w-full rounded-lg shadow-lg border border-slate-200 dark:border-slate-700/60 cursor-crosshair bg-white"
            />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              准备好开始截图了吗？
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              点击上方 <strong>开始截屏</strong> 选取任意屏幕或应用窗口；或者按下系统的截图快捷键后，直接在此页面按 <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-slate-700 dark:text-slate-300">Ctrl + V</kbd> 粘贴。
            </p>
          </div>
        </div>
      )}

      {/* In-Page Draggable Pin Window */}
      {isPinned && imageSrc && (
        <div
          style={{
            position: "fixed",
            left: `${pinPos.x}px`,
            top: `${pinPos.y}px`,
            transform: `scale(${pinScale})`,
            transformOrigin: "top left",
            opacity: pinOpacity,
            zIndex: 9999,
          }}
          className="shadow-2xl rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-900/90 backdrop-blur-md transition-opacity duration-75 select-none animate-in fade-in zoom-in-95"
        >
          {/* Draggable Header */}
          <div
            onMouseDown={startDragPin}
            className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 text-white text-xs cursor-move border-b border-slate-700/80"
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>贴图置顶 (可拖拽移动)</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Opacity slider */}
              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                <span>透明度</span>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={pinOpacity}
                  onChange={(e) => setPinOpacity(Number(e.target.value))}
                  className="w-14 accent-blue-500 h-1 cursor-pointer"
                  title="调节贴图透明度，方便半透明对照"
                />
              </div>

              {/* Zoom Buttons */}
              <button
                onClick={() => setPinScale((s) => Math.max(0.3, s - 0.1))}
                className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px]"
                title="缩小"
              >
                -
              </button>
              <button
                onClick={() => setPinScale((s) => Math.min(2.5, s + 0.1))}
                className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px]"
                title="放大"
              >
                +
              </button>

              {/* Close pin */}
              <button
                onClick={() => setIsPinned(false)}
                className="p-0.5 hover:bg-red-500/80 rounded transition-colors ml-1"
                title="关闭贴图"
              >
                <X className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Pinned Image Content */}
          <div className="max-w-[500px] max-h-[400px] overflow-hidden bg-black/50 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pinnedImageSrc || imageSrc || ""}
              alt="Pinned screenshot"
              className="max-w-full max-h-full object-contain pointer-events-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
