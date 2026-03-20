'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokens, clearTokens } from '@/lib/api';
import { authApi, agentApi } from '@/lib/services';

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isLoading:    boolean;
  isHydrated:   boolean;

  login:  (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser:(user: User) => void;
  hydrate:() => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,
      isHydrated:   false,

      hydrate: () => set({ isHydrated: true }),

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          const { user, tokens } = data.data;

          setTokens(tokens.accessToken, tokens.refreshToken);
          set({
            user,
            accessToken:  tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isLoading:    false,
          });

          // Mark operator online for AI agent awareness
          agentApi.markOnline().catch(() => {});

        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await agentApi.markOffline().catch(() => {});
          if (refreshToken) await authApi.logout(refreshToken);
        } finally {
          clearTokens();
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
    }),
    {
      name:    'auth-storage',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    }
  )
);
