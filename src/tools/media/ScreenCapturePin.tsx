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
  Crop,
  PowerOff,
  Sparkles,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type ToolMode = "select" | "rect" | "arrow" | "brush" | "mosaic";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ScreenCapturePin() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolMode>("select");
  const [strokeColor, setStrokeColor] = useState("#EF4444");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [copied, setCopied] = useState(false);

  // Continuous Stream State (避免每次都重新弹窗选择)
  const [isStreamActive, setIsStreamActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Snip / Crop Mode State (鼠标拖动框选)
  const [isSnipping, setIsSnipping] = useState(false);
  const [snipStart, setSnipStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);

  // In-Page Pin State
  const [isPinned, setIsPinned] = useState(false);
  const [pinPos, setPinPos] = useState({ x: 40, y: 100 });
  const [pinScale, setPinScale] = useState(1);
  const [pinOpacity, setPinOpacity] = useState(0.95);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pinnedImageSrc, setPinnedImageSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snipContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotData = useRef<ImageData | null>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 1. Get or reuse screen capture stream
  const getOrInitStream = async (): Promise<MediaStream | null> => {
    if (streamRef.current && streamRef.current.active) {
      return streamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as MediaTrackConstraints,
        audio: false,
      });

      // Listen for user stopping sharing from browser banner
      stream.getVideoTracks()[0].onended = () => {
        setIsStreamActive(false);
        streamRef.current = null;
      };

      streamRef.current = stream;
      setIsStreamActive(true);

      if (!videoRef.current) {
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        videoRef.current = video;
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      return stream;
    } catch (err) {
      console.warn("Screen capture stream request failed:", err);
      return null;
    }
  };

  // Disconnect stream manually
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreamActive(false);
  };

  // 2. Trigger Drag-to-Select Capture
  const handleStartCapture = async () => {
    const stream = await getOrInitStream();
    if (!stream || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");

    setImageSrc(dataUrl);
    setCropRect(null);
    setSnipStart(null);
    setIsSnipping(true); // 进入鼠标拖拽框选模式
  };

  // 3. Paste from clipboard (Ctrl + V)
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
              setIsSnipping(false);
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

  // 4. Load full image into canvas when not in snipping mode
  useEffect(() => {
    if (!imageSrc || isSnipping || !canvasRef.current) return;
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
  }, [imageSrc, isSnipping]);

  // 5. Drag-to-Select (框选交互处理)
  const handleSnipMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!snipContainerRef.current) return;
    const rect = snipContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSnipStart({ x, y });
    setCropRect({ x, y, w: 0, h: 0 });
  };

  const handleSnipMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!snipStart || !snipContainerRef.current) return;
    const rect = snipContainerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const x = Math.min(snipStart.x, currentX);
    const y = Math.min(snipStart.y, currentY);
    const w = Math.abs(currentX - snipStart.x);
    const h = Math.abs(currentY - snipStart.y);

    setCropRect({ x, y, w, h });
  };

  const handleSnipMouseUp = () => {
    setSnipStart(null);
  };

  // Confirm crop selection
  const applyCrop = () => {
    if (!cropRect || cropRect.w < 5 || cropRect.h < 5 || !imageSrc || !snipContainerRef.current) {
      setIsSnipping(false);
      return;
    }

    const container = snipContainerRef.current;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate scale ratio between real image pixels and displayed container
      const scaleX = img.width / container.clientWidth;
      const scaleY = img.height / container.clientHeight;

      const realX = cropRect.x * scaleX;
      const realY = cropRect.y * scaleY;
      const realW = cropRect.w * scaleX;
      const realH = cropRect.h * scaleY;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = realW;
      cropCanvas.height = realH;
      const ctx = cropCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
        const croppedDataUrl = cropCanvas.toDataURL("image/png");
        setImageSrc(croppedDataUrl);
      }
      setIsSnipping(false);
      setCropRect(null);
    };
    img.src = imageSrc;
  };

  // Direct Pin from Selection
  const pinCurrentSelection = async (mode: "pip" | "page") => {
    if (!cropRect || cropRect.w < 5 || cropRect.h < 5 || !imageSrc || !snipContainerRef.current) {
      return;
    }
    const container = snipContainerRef.current;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const scaleX = img.width / container.clientWidth;
      const scaleY = img.height / container.clientHeight;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropRect.w * scaleX;
      cropCanvas.height = cropRect.h * scaleY;
      const ctx = cropCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        img,
        cropRect.x * scaleX,
        cropRect.y * scaleY,
        cropCanvas.width,
        cropCanvas.height,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );
      const dataUrl = cropCanvas.toDataURL("image/png");

      if (mode === "pip" && "documentPictureInPicture" in window) {
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
            width: Math.min(cropCanvas.width, 900),
            height: Math.min(cropCanvas.height, 600),
          });

          pipWindow.document.title = "📌 贴图置顶 (DevBox)";
          pipWindow.document.body.style.margin = "0";
          pipWindow.document.body.style.padding = "0";
          pipWindow.document.body.style.backgroundColor = "#000000";
          pipWindow.document.body.style.display = "flex";
          pipWindow.document.body.style.alignItems = "center";
          pipWindow.document.body.style.justifyContent = "center";
          pipWindow.document.body.style.overflow = "hidden";

          const pinnedImg = pipWindow.document.createElement("img");
          pinnedImg.src = dataUrl;
          pinnedImg.style.maxWidth = "100%";
          pinnedImg.style.maxHeight = "100%";
          pinnedImg.style.objectFit = "contain";
          pipWindow.document.body.appendChild(pinnedImg);

          setIsSnipping(false);
          setImageSrc(dataUrl);
          return;
        } catch {
          // fallback to in-page
        }
      }

      // In page pin
      setPinnedImageSrc(dataUrl);
      setIsPinned(true);
      setIsSnipping(false);
      setImageSrc(dataUrl);
    };
    img.src = imageSrc;
  };

  // Direct Copy Selection
  const copyCurrentSelection = () => {
    if (!cropRect || cropRect.w < 5 || cropRect.h < 5 || !imageSrc || !snipContainerRef.current) {
      return;
    }
    const container = snipContainerRef.current;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scaleX = img.width / container.clientWidth;
      const scaleY = img.height / container.clientHeight;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropRect.w * scaleX;
      cropCanvas.height = cropRect.h * scaleY;
      const ctx = cropCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        img,
        cropRect.x * scaleX,
        cropRect.y * scaleY,
        cropCanvas.width,
        cropCanvas.height,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      cropCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          await copyToClipboard(cropCanvas.toDataURL("image/png"));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    };
    img.src = imageSrc;
  };

  // Canvas Mouse Events for Annotations
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

      ctx.beginPath();
      ctx.moveTo(startPos.current.x, startPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      const angle = Math.atan2(pos.y - startPos.current.y, pos.x - startPos.current.x);
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
        ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height),
      ]);
    }
  };

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

  // Desktop Picture-in-Picture Pin
  const handleDesktopPiP = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const currentDataUrl = canvas.toDataURL("image/png");

    if ("documentPictureInPicture" in window) {
      try {
        const pipWindow = await (
          window as unknown as {
            documentPictureInPicture: {
              requestWindow: (options: { width: number; height: number }) => Promise<Window>;
            };
          }
        ).documentPictureInPicture.requestWindow({
          width: Math.min(canvas.width, 900),
          height: Math.min(canvas.height, 600),
        });

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
        pipWindow.document.body.appendChild(img);
        return;
      } catch (e) {
        console.warn("Document PiP request failed, falling back:", e);
      }
    }

    setPinnedImageSrc(currentDataUrl);
    setIsPinned(true);
  };

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

  // In-Page Pin Drag Handlers
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

  // Copy Image
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
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
          {/* Main Drag-to-Select Capture Button */}
          <button
            onClick={handleStartCapture}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Camera className="w-4 h-4" />
            <span>
              {isStreamActive ? "⚡ 连续截图 (免弹窗·直接拖选)" : "开始截图 (拖动框选)"}
            </span>
          </button>

          {/* Stream Status Indicator */}
          {isStreamActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>极速免弹窗模式生效中</span>
              <button
                onClick={stopStream}
                className="ml-1 p-0.5 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                title="断开屏幕连接"
              >
                <PowerOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                    if (ev.target?.result) {
                      setImageSrc(ev.target.result as string);
                      setIsSnipping(false);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>

          <span className="text-[11px] text-slate-400 hidden lg:inline-block px-1">
            支持直接按 <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">Ctrl + V</kbd> 粘贴剪贴板截图
          </span>
        </div>

        {imageSrc && !isSnipping && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Re-crop button */}
            <button
              onClick={() => {
                setCropRect(null);
                setSnipStart(null);
                setIsSnipping(true);
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="重新框选局部截图"
            >
              <Crop className="w-3.5 h-3.5 text-blue-500" />
              <span>重新框选</span>
            </button>

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

      {/* 2. Drag-to-Select Crop Viewport (框选模式) */}
      {imageSrc && isSnipping && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="font-semibold">
                按住鼠标左键并在画面上拖动，框选你想要的局部区域：
              </span>
            </div>
            <button
              onClick={() => setIsSnipping(false)}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              取消框选 (保留全图)
            </button>
          </div>

          <div
            ref={snipContainerRef}
            onMouseDown={handleSnipMouseDown}
            onMouseMove={handleSnipMouseMove}
            onMouseUp={handleSnipMouseUp}
            className="relative select-none overflow-hidden rounded-2xl border-2 border-dashed border-blue-400 dark:border-blue-600 cursor-crosshair bg-black/80 flex items-center justify-center max-h-[750px]"
          >
            {/* Background Screenshot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Snip canvas"
              className="max-w-full max-h-[720px] object-contain pointer-events-none opacity-60"
            />

            {/* Dark Mask when selecting */}
            {cropRect && cropRect.w > 0 && cropRect.h > 0 && (
              <>
                {/* Active Selection Box */}
                <div
                  style={{
                    left: `${cropRect.x}px`,
                    top: `${cropRect.y}px`,
                    width: `${cropRect.w}px`,
                    height: `${cropRect.h}px`,
                  }}
                  className="absolute border-2 border-blue-500 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none"
                >
                  {/* Size tag */}
                  <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-mono whitespace-nowrap shadow-md">
                    {Math.round(cropRect.w)} × {Math.round(cropRect.h)} px
                  </div>
                </div>

                {/* Floating Quick Action Bar near selection */}
                <div
                  style={{
                    left: `${cropRect.x}px`,
                    top: `${cropRect.y + cropRect.h + 8}px`,
                  }}
                  className="absolute z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/95 text-white rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={applyCrop}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="确定裁剪"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>完成裁剪</span>
                  </button>

                  <button
                    onClick={() => pinCurrentSelection("pip")}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="选完直接桌面置顶"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>桌面置顶</span>
                  </button>

                  <button
                    onClick={() => pinCurrentSelection("page")}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="网页内钉住"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>贴图</span>
                  </button>

                  <button
                    onClick={copyCurrentSelection}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="复制到剪贴板"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "已复制" : "复制"}</span>
                  </button>

                  <button
                    onClick={() => setCropRect(null)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="取消选区重新选"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Editor & Canvas Area (标注模式) */}
      {imageSrc && !isSnipping && (
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
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">颜色:</span>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 bg-white p-0"
                />
              </div>

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
      )}

      {/* 4. Empty State Guide */}
      {!imageSrc && (
        <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              原生屏幕截取 & 拖拽框选
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
              点击 <strong>“开始截图”</strong> 授权后直接进入全屏鼠标拖动框选；开启 <strong>连续截图模式</strong> 后更可免除反复弹窗确认，截完直接钉在屏幕上！
            </p>
          </div>
        </div>
      )}

      {/* 5. In-Page Draggable Pin Window */}
      {isPinned && (
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
