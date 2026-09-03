"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "dev_tools_favorites";

let cachedRaw: string | null = null;
let cachedParsed: string[] = [];

function getFavoritesSnapshot(): string[] {
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

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getFavoritesSnapshot, getServerSnapshot);

  const toggleFavorite = useCallback((toolId: string) => {
    try {
      const current = getFavoritesSnapshot();
      const next = current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId];
      const serialized = JSON.stringify(next);
      localStorage.setItem(STORAGE_KEY, serialized);
      cachedRaw = serialized;
      cachedParsed = next;
      notify();
    } catch {
      // ignore
    }
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, mounted: true };
}
