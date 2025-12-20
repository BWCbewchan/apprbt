"use client";

import { useEffect, useState } from "react";

type AdminStatsResponse = {
  success: boolean;
  data?: {
    totalTeachers: number;
    totalViews: number;
  };
};

const APPSCRIPT_URL = process.env.NEXT_PUBLIC_APPSCRIPT_URL || "";

export default function VisitorsBadge() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let aborted = false;

    async function load() {
      if (!APPSCRIPT_URL) return;
      try {
        const url = `${APPSCRIPT_URL}?action=getAdminStats`;
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) return;
        const text = await res.text();
        const json: AdminStatsResponse = JSON.parse(text);
        if (!aborted && json.success && json.data) {
          setViews(json.data.totalViews ?? null);
        }
      } catch {
        // silent fail
      }
    }

    load();
    return () => {
      aborted = true;
    };
  }, []);

  if (views === null) return null;

  return (
    <div
      aria-label="Tổng lượt truy cập"
      className="fixed top-3 right-3 z-100 select-none"
    >
      <div className="px-3 py-1 rounded-full bg-black/60 text-white text-xs shadow-md border border-white/10 backdrop-blur">
        <span className="font-semibold">👁 {views.toLocaleString()}</span>
        <span className="opacity-80 ml-1">lượt truy cập</span>
      </div>
    </div>
  );
}
