import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { id: number; username: string; email: string } | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    user: null,
    token: null,
    setAuth: (user, token) => set({ user, token }),
    logout: () => set({ user: null, token: null }),
  }), { name: 'auth-storage' })
);
