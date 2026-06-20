"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

/** Centered modal on desktop, bottom-sheet on mobile. Themed via CSS vars. */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 640,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-fade-in flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[24px] border-2 border-ink bg-surface text-ink shadow-[8px_8px_0_var(--foreground)] sm:max-h-[calc(100vh-96px)] sm:rounded-[16px]"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b-2 border-ink px-5 py-3.5">
          <h2 className="font-serif text-xl font-black text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-extrabold text-ink hover:bg-surface-hover"
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
