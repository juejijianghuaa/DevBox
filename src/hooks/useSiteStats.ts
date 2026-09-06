"use client";

import { useEffect, useState } from "react";

export function useSiteStats() {
  const [totalViews, setTotalViews] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function recordAndFetch() {
      try {
        const hasVisited = sessionStorage.getItem("devbox_visited");
        let res: Response;

        if (!hasVisited) {
          sessionStorage.setItem("devbox_visited", "1");
          res = await fetch("/api/stats", { method: "POST" });
        } else {
          res = await fetch("/api/stats");
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.total === "number") {
            setTotalViews(data.total);
          }
        }
      } catch {
        // Silently fail in dev or offline
      }
    }

    recordAndFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  return { totalViews };
}
