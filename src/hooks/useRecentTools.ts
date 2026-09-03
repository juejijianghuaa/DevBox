"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "dev_tools_recent";
const MAX_RECENT = 6;

let cachedRaw: string | null = null;
let cachedParsed: string[] = [];

function getRecentSnapshot(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedParsed = raw ? JSON.parse(raw) : [];
    }
    return cachedParsed;
  } catch {
    return cachedParsed;
  }
}

const emptyList: string[] = [];
function getServerSnapshot(): string[] {
  return emptyList;
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

export function useRecentTools() {
  const recentTools = useSyncExternalStore(subscribe, getRecentSnapshot, getServerSnapshot);

  const addRecentTool = useCallback((toolId: string) => {
    try {
      const current = getRecentSnapshot();
      const filtered = current.filter((id) => id !== toolId);
      const updated = [toolId, ...filtered].slice(0, MAX_RECENT);
      const serialized = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY, serialized);
      cachedRaw = serialized;
      cachedParsed = updated;
      notify();
    } catch {
      // ignore
    }
  }, []);

  return { recentTools, addRecentTool, mounted: true };
}
