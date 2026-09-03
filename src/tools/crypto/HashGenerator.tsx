"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

// Lightweight pure JS MD5
function md5(str: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const bin = (function (s: string) {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < s.length * 8; i += 8) {
      bin[i >> 5] |= (s.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  })(unescape(encodeURIComponent(str)));

  const len = str.length * 8;
  bin[len >> 5] |= 0x80 << len % 32;
  bin[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < bin.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, bin[i + 0], 7, -680876936);
    d = md5ff(d, a, b, c, bin[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, bin[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, bin[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, bin[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, bin[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, bin[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, bin[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, bin[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, bin[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, bin[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, bin[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, bin[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, bin[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, bin[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, bin[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, bin[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, bin[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, bin[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, bin[i + 0], 20, -373897302);
    a = md5gg(a, b, c, d, bin[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, bin[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, bin[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, bin[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, bin[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, bin[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, bin[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, bin[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, bin[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, bin[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, bin[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, bin[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, bin[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, bin[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, bin[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, bin[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, bin[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, bin[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, bin[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, bin[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, bin[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, bin[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, bin[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, bin[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, bin[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, bin[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, bin[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, bin[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, bin[i + 0], 6, -198630844);
    d = md5ii(d, a, b, c, bin[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, bin[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, bin[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, bin[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, bin[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, bin[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, bin[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, bin[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, bin[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, bin[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, bin[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, bin[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, bin[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, bin[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, bin[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexDigits = "0123456789abcdef";
  let output = "";
  const arr = [a, b, c, d];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      output += hexDigits.charAt((arr[i] >> (j * 8 + 4)) & 0x0f) + hexDigits.charAt((arr[i] >> (j * 8)) & 0x0f);
    }
  }
  return output;
}

export default function HashGenerator() {
  const [input, setInput] = useState("Hello, World!");
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState<Record<string, string>>({
    MD5: "",
    "SHA-1": "",
    "SHA-256": "",
    "SHA-512": "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function calculate() {
      if (!input) {
        setHashes({ MD5: "", "SHA-1": "", "SHA-256": "", "SHA-512": "" });
        return;
      }
      // MD5
      const md5Val = md5(input);

      // Web Crypto for SHA
      const enc = new TextEncoder().encode(input);
      const sha1Buf = await crypto.subtle.digest("SHA-1", enc);
      const sha256Buf = await crypto.subtle.digest("SHA-256", enc);
      const sha512Buf = await crypto.subtle.digest("SHA-512", enc);

      const bufToHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      setHashes({
        MD5: md5Val,
        "SHA-1": bufToHex(sha1Buf),
        "SHA-256": bufToHex(sha256Buf),
        "SHA-512": bufToHex(sha512Buf),
      });
    }

    calculate();
  }, [input]);

  const copyVal = async (text: string, key: string) => {
    const formatted = uppercase ? text.toUpperCase() : text.toLowerCase();
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">输入文本内容</label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              大写输出 (Uppercase)
            </label>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="在此输入需要计算哈希的文本..."
          className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Hashes List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          计算哈希结果 (实时计算)
        </div>

        {Object.entries(hashes).map(([algo, value]) => {
          const displayVal = value ? (uppercase ? value.toUpperCase() : value.toLowerCase()) : "-";
          return (
            <div
              key={algo}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-20 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 font-mono">
                  {algo}
                </span>
                <span className="text-xs font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                  {displayVal}
                </span>
              </div>

              {value && (
                <button
                  onClick={() => copyVal(value, algo)}
                  className="self-end sm:self-auto px-2.5 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === algo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
