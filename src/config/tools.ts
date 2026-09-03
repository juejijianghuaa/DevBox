import { Category, ToolMeta } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "all",
    name: "全部工具",
    description: "汇集所有实用小工具",
    iconName: "LayoutGrid",
  },
  {
    id: "dev",
    name: "开发运维",
    description: "代码、格式化与开发提效工具",
    iconName: "Code2",
  },
  {
    id: "crypto",
    name: "加解密与生成",
    description: "哈希、编码转换与安全生成",
    iconName: "ShieldCheck",
  },
  {
    id: "text",
    name: "文本处理",
    description: "对比、转换、统计与正则",
    iconName: "FileText",
  },
  {
    id: "daily",
    name: "常用转换",
    description: "时间、色彩、二维码等生活办公工具",
    iconName: "Wrench",
  },
];

export const TOOLS: ToolMeta[] = [
  {
    id: "json-formatter",
    name: "JSON 格式化 & 校验",
    description: "JSON 美化、语法校验、压缩、转义与错误定位",
    category: "dev",
    iconName: "FileJson",
    keywords: ["json", "format", "beautify", "lint", "compress", "parse", "校验", "格式化"],
    badge: "热门",
  },
  {
    id: "timestamp-converter",
    name: "时间戳转换器",
    description: "Unix 时间戳与标准日期互转，支持毫秒/秒与相对时间计算",
    category: "daily",
    iconName: "Clock",
    keywords: ["timestamp", "time", "date", "unix", "时间戳", "时区", "日期"],
    badge: "热门",
  },
  {
    id: "base64-codec",
    name: "Base64 / URL 编解码",
    description: "文本与图片 Base64 编解码，URL 参数安全转义",
    category: "crypto",
    iconName: "Binary",
    keywords: ["base64", "url", "encode", "decode", "编码", "解码", "转义"],
    badge: "推荐",
  },
  {
    id: "hash-generator",
    name: "哈希计算器 (MD5/SHA)",
    description: "纯前端安全生成 MD5、SHA-1、SHA-256、SHA-512 校验哈希值",
    category: "crypto",
    iconName: "Fingerprint",
    keywords: ["hash", "md5", "sha1", "sha256", "sha512", "摘要", "哈希", "加密"],
    badge: "推荐",
  },
  {
    id: "password-generator",
    name: "UUID / 强密码生成器",
    description: "批量生成安全随机密码、UUID v4，支持规则定制",
    category: "crypto",
    iconName: "KeyRound",
    keywords: ["uuid", "guid", "password", "random", "密码", "随机数", "生成器"],
  },
  {
    id: "qrcode-generator",
    name: "二维码生成器",
    description: "文本/网址实时生成二维码，支持自定义颜色、纠错等级与高清下载",
    category: "daily",
    iconName: "QrCode",
    keywords: ["qrcode", "qr", "二维码", "生成", "下载"],
    badge: "新上线",
  },
  {
    id: "text-diff",
    name: "文本对比 (Diff)",
    description: "两段文本逐行、逐词差异高亮比对，快速找出变动点",
    category: "text",
    iconName: "GitCompare",
    keywords: ["diff", "compare", "text", "差异", "对比", "文本对比"],
  },
  {
    id: "color-converter",
    name: "颜色转换 & 调色板",
    description: "HEX、RGB、HSL 颜色值双向转换，带实时预览与明暗调色板",
    category: "daily",
    iconName: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "颜色", "调色板", "取色"],
  },
  {
    id: "screen-capture-pin",
    name: "屏幕截图 & 悬浮贴图",
    description: "原生屏幕截取与剪贴板快速粘贴，支持标注、裁剪及桌面/网页窗口悬浮贴图置顶",
    category: "daily",
    iconName: "Pin",
    keywords: ["screenshot", "capture", "snipaste", "pin", "截屏", "贴图", "截图", "悬浮窗"],
    badge: "新上线",
  },
];

export function getToolById(id: string): ToolMeta | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(categoryId: string): ToolMeta[] {
  if (categoryId === "all") return TOOLS;
  return TOOLS.filter((tool) => tool.category === categoryId);
}
