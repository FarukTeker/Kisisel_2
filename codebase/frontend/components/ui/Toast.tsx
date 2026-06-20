"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, onDone, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, onDone, duration]);

  if (!message) return null;

  return (
    <div className="animate-fade-in fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-pill border border-line bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-lift">
      {message}
    </div>
  );
}
