"use client";

import { use, useEffect, useState } from "react";
import { Responsive, useContainerWidth, type Layout } from "react-grid-layout";
import Widget from "@/components/news/Widget";
import { fetchSharedNewspaper, type DashboardState } from "@/features/dashboard/api";
import { useSettingsStore } from "@/features/settings/store";

export default function SharedNewspaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState(false);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });

  useEffect(() => {
    fetchSharedNewspaper(slug)
      .then((np) => {
        // Render the shared paper in the language it was published in, so its
        // widgets fetch the matching localized article text.
        setLanguage(np.language);
        setState(np);
      })
      .catch(() => setError(true));
  }, [slug, setLanguage]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-semibold text-muted">Newspaper not found.</p>
      </main>
    );
  }
  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </main>
    );
  }

  const cols = { lg: state.columns, md: state.columns, sm: 1, xs: 1, xxs: 1 };
  const rgLayout = state.layout as unknown as Layout;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <h1 className="flex items-center gap-1.5 font-serif text-xl font-black uppercase tracking-tight text-ink">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Kişisel — Shared
          </h1>
        </div>
      </header>
      <main ref={containerRef} className="mx-auto max-w-6xl px-4 py-6">
        {mounted && (
          <Responsive
            className="feed-rgl"
            width={width}
            layouts={{ lg: rgLayout, md: rgLayout, sm: rgLayout, xs: rgLayout, xxs: rgLayout }}
            breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0, xxs: 0 }}
            cols={cols}
            rowHeight={state.readingMode === "F" ? 120 : 96}
            margin={[20, 20]}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: false }}
            resizeConfig={{ enabled: false }}
          >
            {state.widgets.map((w) => (
              <div key={w.id}>
                <Widget config={w} mode={state.readingMode} />
              </div>
            ))}
          </Responsive>
        )}
      </main>
    </div>
  );
}
