"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalAudioPlayer from "@/components/news/GlobalAudioPlayer";

export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session; created lazily so it isn't shared across requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GlobalAudioPlayer />
    </QueryClientProvider>
  );
}

