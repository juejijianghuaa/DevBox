import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevBox - 纯前端极客工具箱 | 零服务器成本 · 数据不上云",
  description:
    "轻量、极速、隐私优先的现代化在线开发者小工具合集。提供 JSON 格式化、时间戳转换、Base64 编解码、哈希计算、UUID 与随机密码生成、二维码生成、文本对比等实用工具。",
  keywords: [
    "在线工具箱",
    "开发者工具",
    "JSON格式化",
    "时间戳转换",
    "Base64编解码",
    "哈希计算",
    "UUID生成",
    "二维码生成",
    "文本对比",
    "WebTools",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
