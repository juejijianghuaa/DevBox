"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "dev_tools_stats";

export interface ToolStatItem {
  lastDate: string; // "YYYY-MM-DD"
  todayCount: number;
  totalCount: number;
}

export type ToolStatsMap = Record<string, ToolStatItem>;

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

let cachedRaw: string | null = null;
let cachedParsed: ToolStatsMap = {};

function getStatsSnapshot(): ToolStatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : {};
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

const emptyStats: ToolStatsMap = {};
function getServerSnapshot(): ToolStatsMap {
  return emptyStats;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

const emptySubscribe = () => () => {};

export function useToolStats() {
  const statsMap = useSyncExternalStore(subscribe, getStatsSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const getToolStats = useCallback(
    (toolId: string) => {
      const item = statsMap[toolId];
      if (!item) {
        return { todayCount: 0, totalCount: 0 };
      }
      const today = getTodayStr();
      return {
        todayCount: item.lastDate === today ? item.todayCount : 0,
        totalCount: item.totalCount || 0,
      };
    },
    [statsMap]
  );

  const recordToolOpen = useCallback((toolId: string) => {
    try {
      const current = getStatsSnapshot();
      const today = getTodayStr();
      const existing = current[toolId] || { lastDate: today, todayCount: 0, totalCount: 0 };

      const isToday = existing.lastDate === today;
      const updatedItem: ToolStatItem = {
        lastDate: today,
        todayCount: (isToday ? existing.todayCount : 0) + 1,
        totalCount: (existing.totalCount || 0) + 1,
      };

      const nextMap: ToolStatsMap = {
        ...current,
        [toolId]: updatedItem,
      };

      const serialized = JSON.stringify(nextMap);
      localStorage.setItem(STORAGE_KEY, serialized);
      cachedRaw = serialized;
      cachedParsed = nextMap;
      notify();
    } catch {
      // ignore
    }
  }, []);

  const getTotalStats = useCallback(() => {
    const today = getTodayStr();
    let todayTotal = 0;
    let grandTotal = 0;
    Object.values(statsMap).forEach((item) => {
      if (item.lastDate === today) {
        todayTotal += item.todayCount || 0;
      }
      grandTotal += item.totalCount || 0;
    });
    return { todayTotal, grandTotal };
  }, [statsMap]);

  return { statsMap, getToolStats, recordToolOpen, getTotalStats, mounted };
}
