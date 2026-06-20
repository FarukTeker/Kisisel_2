"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BentoGrid } from "react-bento";
import Navbar from "@/components/layout/Navbar";
import Widget from "@/components/news/Widget";
import { useAuthStore } from "@/features/auth/store";
import { useProfile } from "@/features/auth/queries";
import { DEFAULT_WIDGETS } from "@/features/dashboard/widgets";
import type { ReadingMode } from "@/features/articles/reading-mode";

export default function Dashboard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { isLoading } = useProfile();
  const [mode, setMode] = useState<ReadingMode>("S");

  // Auth guard.
  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const items = useMemo(
    () =>
      DEFAULT_WIDGETS.map((config, index) => ({
        id: index,
        title: config.title,
        width: config.width,
        height: config.height,
        element: <Widget config={config} mode={mode} />,
      })),
    [mode],
  );

  if (!token || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar mode={mode} onModeChange={setMode} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <BentoGrid
          items={items}
          gridCols={4}
          rowHeight={90}
          classNames={{
            container: "gap-4",
            elementContainer: "bg-transparent",
          }}
        />
      </main>
    </div>
  );
}
