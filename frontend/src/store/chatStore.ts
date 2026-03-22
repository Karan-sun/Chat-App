import { create } from 'zustand';

export interface Message { 
  id: number; 
  content: string; 
  username: string; 
  user_id: number; 
  timestamp: string; 
  status?: 'SENT'|'DELIVERED'|'READ'; 
  sender_id?: number;
  receiver_id?: number;
}

interface ChatState {
  roomMessages: Record<number, Message[]>;
  dmMessages: Record<number, Message[]>;
  typingUsers: Record<string, string[]>;
  addRoomMessage: (roomId: number, msg: Message) => void;
  setRoomMessages: (roomId: number, msgs: Message[]) => void;
  addDMMessage: (userId: number, msg: Message) => void;
  setDMMessages: (userId: number, msgs: Message[]) => void;
  updateMessageStatus: (dmUserId: number, msgId: number, status: string) => void;
  updateMessagesStatus: (dmUserId: number, msgIds: number[], status: string) => void;
  setTyping: (key: string, usernames: string[]) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  roomMessages: {},
  dmMessages: {},
  typingUsers: {},
  addRoomMessage: (roomId, msg) => set((state) => {
    const currentMsgs = state.roomMessages[roomId] || [];
    if (currentMsgs.some(m => m.id === msg.id)) return state;
    return {
      roomMessages: {
        ...state.roomMessages,
        [roomId]: [...currentMsgs, msg]
      }
    };
  }),
  setRoomMessages: (roomId, msgs) => set((state) => ({
    roomMessages: {
      ...state.roomMessages,
      [roomId]: msgs
    }
  })),
  addDMMessage: (userId, msg) => set((state) => {
    const currentMsgs = state.dmMessages[userId] || [];
    if (currentMsgs.some(m => m.id === msg.id)) return state;
    return {
      dmMessages: {
        ...state.dmMessages,
        [userId]: [...currentMsgs, msg]
      }
    };
  }),
  setDMMessages: (userId, msgs) => set((state) => ({
    dmMessages: {
      ...state.dmMessages,
      [userId]: msgs
    }
  })),
  updateMessageStatus: (dmUserId, msgId, status) => set((state) => ({
    dmMessages: {
      ...state.dmMessages,
      [dmUserId]: (state.dmMessages[dmUserId] || []).map(m => 
        m.id === msgId ? { ...m, status: status as any } : m
      )
    }
  })),
  updateMessagesStatus: (dmUserId, msgIds, status) => set((state) => ({
    dmMessages: {
      ...state.dmMessages,
      [dmUserId]: (state.dmMessages[dmUserId] || []).map(m => 
        msgIds.includes(m.id) ? { ...m, status: status as any } : m
      )
    }
  })),
  setTyping: (key, usernames) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [key]: usernames
    }
  }))
}));
