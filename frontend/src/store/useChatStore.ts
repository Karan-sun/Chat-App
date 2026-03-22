import { create } from 'zustand'

interface ChatState {
    activeRoomId: string | null;
    activeUserId: number | null;
    isSidebarOpen: boolean;
    setActiveRoom: (roomId: string) => void;
    setActiveUser: (userId: number) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    activeRoomId: null,
    activeUserId: null,
    isSidebarOpen: true,

    setActiveRoom: (roomId) => set({ activeRoomId: roomId, activeUserId: null }),
    setActiveUser: (userId) => set({ activeUserId: userId, activeRoomId: null }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}))
