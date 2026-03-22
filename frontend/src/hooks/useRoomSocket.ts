import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

export function useRoomSocket(roomId: number) {
  const token = useAuthStore(s => s.token);
  const addRoomMessage = useChatStore(s => s.addRoomMessage);
  const setTyping = useChatStore(s => s.setTyping);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token || !roomId) return;
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/${roomId}?token=${token}`
    );
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') addRoomMessage(roomId, data);
      if (data.type === 'typing') {
        setTyping(`room_${roomId}`, [data.username]);
        setTimeout(() => setTyping(`room_${roomId}`, []), 3000);
      }
    };

    ws.onerror = () => console.error('Room WS error');
    return () => ws.close();
  }, [roomId, token, addRoomMessage, setTyping]);

  const sendMessage = useCallback((content: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'message', content }));
  }, []);

  const sendTyping = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'typing' }));
  }, []);

  return { sendMessage, sendTyping };
}
