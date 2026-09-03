# DevBox - 纯前端极客实用工具箱

一个轻量、极速、注重隐私的现代化在线开发者小工具集合。基于 **Next.js 16 (Turbopack) + React 19 + Tailwind CSS + Lucide Icons** 构建，采用纯静态预渲染（SSG），**零服务器成本，数据 100% 本地运算不上云**。

---

## 🌟 核心特性

- 🛡️ **100% 隐私安全**：所有计算、编解码、哈希与生成均在浏览器端执行，零数据上传。
- ⚡ **零服务器成本**：构建输出纯静态 HTML/CSS/JS（`out/` 目录），可一键免费托管在 Cloudflare Pages、Vercel、GitHub Pages 等。
- 🚀 **SEO 深度优化**：每个工具拥有独立 URL 静态页面，针对长尾搜索自动生成对应 Meta 标题与描述。
- 🔍 **全局快捷搜索**：支持随时随地按 `Ctrl + K` / `Cmd + K` 唤起搜索面板，支持拼音、中文与英文模糊匹配。
- ⭐ **本地收藏与最近使用**：基于浏览器 `localStorage` 自动同步收藏夹与历史使用足迹，无须登录。
- 🌓 **暗黑模式自适应**：支持暗色/亮色无缝切换，跟随系统偏好，持久化记录。

---

## 🛠️ 当前已集成的工具清单

| 分类 | 工具名称 | 路由路径 | 功能亮点 |
| :--- | :--- | :--- | :--- |
| **开发运维** | **JSON 格式化 & 校验** | `/tools/json-formatter` | 2/4空格/Tab美化、压缩、字符串转义与反转义、语法错误提示 |
| **常用转换** | **时间戳转换器** | `/tools/timestamp-converter` | 实时时间流秒表、秒/毫秒互转、本地/ISO 8601标准格式输出 |
| **加解密** | **Base64 / URL 编解码** | `/tools/base64-codec` | UTF-8 安全文本编解码、URL 参数编码、本地图片拖拽转 Base64 |
| **加解密** | **哈希计算器** | `/tools/hash-generator` | 原生 Web Crypto + MD5 计算，一次性输出 MD5/SHA-1/SHA-256/SHA-512 |
| **加解密** | **UUID / 强密码生成器** | `/tools/password-generator` | 批量生成 UUID v4、自定义密码字符集、密码强度评分器 |
| **常用转换** | **二维码生成器** | `/tools/qrcode-generator` | 实时生成二维码、自定义纠错等级(L/M/Q/H)、自定义前景色/背景色、高清PNG下载 |
| **文本处理** | **文本对比 (Diff)** | `/tools/text-diff` | 逐行比对原文本与修改文本，高亮新增/删除差异，提供统计数据 |
| **常用转换** | **颜色转换 & 调色板** | `/tools/color-converter` | HEX / RGB / HSL 双向实时转换、可视化调色盘取色、明暗阶梯渐变生成 |

---

## 💡 如何添加一个新工具（仅需两步）

本站采用**插件化模块解耦设计**，添加新工具只需两步：

### 第一步：在 `src/tools/` 目录下编写你的工具组件
例如新建 `src/tools/dev/JwtDebugger.tsx`：
```tsx
"use client";

import React from "react";

export default function JwtDebugger() {
  return (
    <div className="space-y-4">
      {/* 你的工具交互 UI */}
    </div>
  );
}
```

并在 `src/tools/registry.tsx` 的 `ToolRenderer` 中添加该分支：
```tsx
case "jwt-debugger":
  return <JwtDebugger />;
```

### 第二步：在 `src/config/tools.ts` 中注册工具元数据
```ts
{
  id: "jwt-debugger",
  name: "JWT 解码与验证",
  description: "在线解析 JSON Web Token 的 Header、Payload 和签名",
  category: "dev",
  iconName: "Key",
  keywords: ["jwt", "token", "auth", "decode"],
  badge: "新上线",
}
```

🎉 **完成！** 
路由 `/tools/jwt-debugger`、静态 HTML 导出、SEO 元标签、首页卡片、分类筛选、`Ctrl + K` 搜索、收藏系统将**全部自动生效**！

---

## 💻 本地开发与构建

```bash
# 启动本地开发热更新服务器 (默认端口 3000)
pnpm dev

# 代码质量检查
pnpm lint

# 静态打包编译 (输出到 out/ 目录)
pnpm build
```

---

## 🚀 生产部署指南

打包生成的 `out/` 文件夹为标准纯静态网页集合：

1. **Cloudflare Pages**：
   - 连接 GitHub 仓库；
   - 构建命令填：`pnpm build`；
   - 输出目录填：`out`。
2. **Vercel**：
   - 导入仓库直接部署，自动识别 Next.js。
3. **GitHub Pages**：
   - 使用官方静态部署 Action，将 `out` 目录推送到 `gh-pages` 分支即可。
