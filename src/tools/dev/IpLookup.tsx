"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Search,
  Copy,
  Check,
  RotateCw,
  MapPin,
  Network,
  Clock,
  ExternalLink,
  ShieldCheck,
  Laptop,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface IpInfo {
  ip: string;
  type?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postal?: string;
  timezone?: {
    id?: string;
    current_time?: string;
    utc?: string;
  };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  flag?: {
    emoji?: string;
  };
}

const POPULAR_IPS = [
  { name: "Google DNS", ip: "8.8.8.8" },
  { name: "Cloudflare", ip: "1.1.1.1" },
  { name: "阿里 DNS", ip: "223.5.5.5" },
  { name: "114 DNS", ip: "114.114.114.114" },
  { name: "GitHub", ip: "20.205.243.166" },
];

export default function IpLookup() {
  const [query, setQuery] = useState("");
  const [ipData, setIpData] = useState<IpInfo | null>(null);
  const [myIp, setMyIp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Fetch IP details from ipwho.is with fallback
  const fetchIpDetails = useCallback(async (targetIp?: string) => {
    setLoading(true);
    setError(null);
    const target = targetIp ? targetIp.trim() : "";

    try {
      // 1. Primary provider: ipwho.is
      const url = target ? `https://ipwho.is/${encodeURIComponent(target)}` : "https://ipwho.is/";
      const res = await fetch(url);
      const data = await res.json();

      if (data.success === false) {
        throw new Error(data.message || "无法解析该 IP 或域名");
      }

      setIpData(data);
      if (!target) {
        setMyIp(data.ip);
      }
    } catch (primaryErr) {
      // 2. Fallback provider: ipapi.co
      try {
        const fallbackUrl = target ? `https://ipapi.co/${encodeURIComponent(target)}/json/` : "https://ipapi.co/json/";
        const res2 = await fetch(fallbackUrl);
        const d2 = await res2.json();

        if (d2.error) {
          throw new Error(d2.reason || "查询失败");
        }

        const fallbackData: IpInfo = {
          ip: d2.ip,
          type: d2.version,
          country: d2.country_name,
          country_code: d2.country_code,
          region: d2.region,
          city: d2.city,
          latitude: d2.latitude,
          longitude: d2.longitude,
          postal: d2.postal,
          timezone: {
            id: d2.timezone,
            utc: d2.utc_offset,
          },
          connection: {
            asn: d2.asn,
            org: d2.org,
            isp: d2.org,
          },
        };
        setIpData(fallbackData);
        if (!target) {
          setMyIp(fallbackData.ip);
        }
      } catch {
        setError(primaryErr instanceof Error ? primaryErr.message : "查询失败，请检查网络或输入的 IP 地址");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, auto-fetch local client IP asynchronously
  useEffect(() => {
    let ignore = false;
    async function initClientIp() {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (!ignore && data.success !== false) {
          setIpData(data);
          setMyIp(data.ip);
        }
      } catch {
        try {
          const res2 = await fetch("https://ipapi.co/json/");
          const d2 = await res2.json();
          if (!ignore && !d2.error) {
            setIpData({
              ip: d2.ip,
              type: d2.version,
              country: d2.country_name,
              country_code: d2.country_code,
              region: d2.region,
              city: d2.city,
              latitude: d2.latitude,
              longitude: d2.longitude,
              postal: d2.postal,
              timezone: {
                id: d2.timezone,
                utc: d2.utc_offset,
              },
              connection: {
                asn: d2.asn,
                org: d2.org,
                isp: d2.org,
              },
            });
            setMyIp(d2.ip);
          }
        } catch {
          // fallback ignore
        }
      }
    }
    initClientIp();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      fetchIpDetails(query);
    } else {
      fetchIpDetails();
    }
  };

  const copyVal = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入任意想要查询的 IPv4 / IPv6 地址或域名 (如 8.8.8.8 或 github.com)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 dark:text-slate-100 font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>查询 IP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                fetchIpDetails();
              }}
              disabled={loading}
              className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="重新检测我的本机公网 IP"
            >
              <Laptop className="w-4 h-4 text-blue-500" />
              <span>查本机 IP</span>
            </button>
          </div>
        </form>

        {/* Popular Quick Samples */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-medium mr-1">常用公共 DNS 测查:</span>
          {POPULAR_IPS.map((item) => (
            <button
              key={item.ip}
              type="button"
              onClick={() => {
                setQuery(item.ip);
                fetchIpDetails(item.ip);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 font-mono transition-colors cursor-pointer text-[11px]"
            >
              <span>{item.name}</span>
              <span className="text-slate-400 ml-1">({item.ip})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* IP Information Cards Grid */}
      {ipData && (
        <div className="space-y-4">
          {/* Main Primary IP Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                  {ipData.type || "IPv4"}
                </span>
                {myIp && ipData.ip === myIp && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                    🟢 我的当前设备公网 IP
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight select-all">
                  {ipData.ip}
                </h2>
                <button
                  onClick={() => copyVal(ipData.ip, "main_ip")}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                  title="复制 IP"
                >
                  {copiedKey === "main_ip" ? (
                    <Check className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-2">
                <span>{ipData.flag?.emoji || "🌐"}</span>
                <span>
                  {[ipData.country, ipData.region, ipData.city].filter(Boolean).join(" · ")}
                </span>
                <span>·</span>
                <span>{ipData.connection?.isp || ipData.connection?.org || "未知运营商"}</span>
              </p>
            </div>

            <div className="z-10 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => fetchIpDetails(ipData.ip)}
                disabled={loading}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-sm"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>刷新解析</span>
              </button>
            </div>

            {/* Background Graphic */}
            <Globe className="w-64 h-64 absolute -right-12 -bottom-16 text-white/5 pointer-events-none" />
          </div>

          {/* Details 3-Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Geolocation */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>地理位置信息</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">国家 / 地区</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {ipData.flag?.emoji && <span>{ipData.flag.emoji}</span>}
                    <span>{ipData.country || "-"}</span>
                    {ipData.country_code && (
                      <span className="text-slate-400">({ipData.country_code})</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">省份 / 州</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {ipData.region || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">城市 (City)</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {ipData.city || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">经纬度 (Lat/Lng)</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>
                      {ipData.latitude ? `${ipData.latitude}, ${ipData.longitude}` : "-"}
                    </span>
                    {ipData.latitude && ipData.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${ipData.latitude},${ipData.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                        title="在地图中查看"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">邮政编码 (Postal)</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {ipData.postal || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Network & ISP */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Network className="w-4 h-4 text-indigo-500" />
                <span>网络与运营商 (ISP)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">网络运营商 (ISP)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[170px] truncate">
                    {ipData.connection?.isp || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">所属组织 (Org)</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[170px] truncate">
                    {ipData.connection?.org || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">自治系统号 (ASN)</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {ipData.connection?.asn ? `AS${ipData.connection.asn}` : "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">反向域名解析</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-right max-w-[170px] truncate">
                    {ipData.connection?.domain || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Timezone & Local Time */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span>时区与时间信息</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">时区 (Timezone)</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                    {ipData.timezone?.id || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">UTC 偏移</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {ipData.timezone?.utc || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">当地时间</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {ipData.timezone?.current_time
                      ? new Date(ipData.timezone.current_time).toLocaleTimeString("zh-CN")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw JSON Toggle for Developers */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="hover:text-blue-500 flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>{showRaw ? "收起原始 JSON 数据" : "查看完整 JSON 响应数据"}</span>
              </button>

              {showRaw && (
                <button
                  onClick={() => copyVal(JSON.stringify(ipData, null, 2), "raw_json")}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {copiedKey === "raw_json" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "raw_json" ? "已复制 JSON" : "复制全部 JSON"}</span>
                </button>
              )}
            </div>

            {showRaw && (
              <pre className="mt-2 p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-auto max-h-64 border border-slate-800 select-all">
                {JSON.stringify(ipData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Security Privacy Notice */}
      <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          查询通过浏览器端直接调用开放安全查询接口，不记录也不存储任何用户的访问记录与 IP 历史。
        </span>
      </div>
    </div>
  );
}
