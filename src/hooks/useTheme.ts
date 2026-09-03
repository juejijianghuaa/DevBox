"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "dev_tools_theme";

let cachedTheme: "light" | "dark" = "light";

function getThemeSnapshot(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null;
  if (stored) {
    cachedTheme = stored;
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    cachedTheme = prefersDark ? "dark" : "light";
  }
  return cachedTheme;
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
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

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    cachedTheme = next;
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    notify();
  }, []);

  return { theme, toggleTheme, mounted: true };
}
