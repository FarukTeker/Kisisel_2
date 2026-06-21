"use client";

import type { Edition } from "@/features/articles/schemas";

interface EditionPickerProps {
  editions: Edition[];
  /** undefined = latest/today's edition. */
  value: string | undefined;
  onChange: (date: string | undefined) => void;
}

function label(date: string, isLatest: boolean): string {
  const pretty = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return isLatest ? `Today — ${pretty}` : pretty;
}

/** History selector: pick which day's edition the dashboard renders. */
export default function EditionPicker({ editions, value, onChange }: EditionPickerProps) {
  if (editions.length === 0) return null;

  const latest = editions[0].date;
  const viewingPast = value !== undefined && value !== latest;

  return (
    <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
      <span className="text-[0.7rem] font-extrabold uppercase tracking-wide text-muted">
        Edition
      </span>
      <select
        value={value ?? latest}
        onChange={(e) => {
          const d = e.target.value;
          onChange(d === latest ? undefined : d);
        }}
        className="rounded-pill border border-line bg-surface px-3 py-1 text-xs font-bold text-ink"
      >
        {editions.map((ed) => (
          <option key={ed.date} value={ed.date}>
            {label(ed.date, ed.date === latest)} · {ed.count}
          </option>
        ))}
      </select>

      {viewingPast && (
        <button
          onClick={() => onChange(undefined)}
          className="rounded-pill bg-brand px-3 py-1 text-xs font-extrabold uppercase text-white"
        >
          Back to today
        </button>
      )}
    </div>
  );
}
