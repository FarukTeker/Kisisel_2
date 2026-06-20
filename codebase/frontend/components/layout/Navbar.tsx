"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { useLogout } from "@/features/auth/queries";
import {
  READING_MODE_LABEL,
  type ReadingMode,
} from "@/features/articles/reading-mode";

const MODES: ReadingMode[] = ["S", "H", "F"];

interface NavbarProps {
  mode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
}

export default function Navbar({ mode, onModeChange }: NavbarProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-soft/80 px-6 py-3 backdrop-blur">
      <h1 className="font-serif text-2xl font-black uppercase tracking-tight text-ink">
        Kişisel
      </h1>

      <div className="flex items-center gap-1 rounded-pill border border-line bg-surface p-1">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`rounded-pill px-3 py-1 text-xs font-extrabold uppercase transition-colors ${
              mode === m ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-hover"
            }`}
          >
            {READING_MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-ink-soft">{user?.name}</span>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="rounded-pill bg-ink px-4 py-1.5 text-xs font-extrabold uppercase text-white"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
