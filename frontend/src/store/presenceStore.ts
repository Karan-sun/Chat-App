import { create } from 'zustand';

interface PresenceState {
  onlineUsers: Set<number>;
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  setOnlineUsers: (ids: number[]) => void;
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  onlineUsers: new Set(),
  setOnline: (id) => set(s => ({ onlineUsers: new Set([...s.onlineUsers, id]) })),
  setOffline: (id) => set(s => {
    const next = new Set(s.onlineUsers); 
    next.delete(id); 
    return { onlineUsers: next };
  }),
  setOnlineUsers: (ids) => set({ onlineUsers: new Set(ids) }),
}));
