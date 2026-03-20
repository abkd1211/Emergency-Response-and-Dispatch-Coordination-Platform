'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocketStore } from '@/store/socket.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  30 * 1000,   // 30 seconds
      gcTime:     5 * 60 * 1000, // 5 minutes
      retry:      1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Socket Manager — connects when user is authenticated ─────────────────────
function SocketManager() {
  const { user, accessToken } = useAuthStore();
  const { connect, disconnect, connected } = useSocketStore();

  useEffect(() => {
    if (user && accessToken && !connected) {
      connect(accessToken);
    }
    if (!user && connected) {
      disconnect();
    }
  }, [user, accessToken, connected, connect, disconnect]);

  return null;
}

// ─── Heartbeat — keeps operator presence alive ─────────────────────────────
function HeartbeatManager() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    const { agentApi } = require('@/lib/services');
    agentApi.heartbeat().catch(() => {});
    const interval = setInterval(() => {
      agentApi.heartbeat().catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <SocketManager />
        <HeartbeatManager />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
