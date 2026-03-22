import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { usePresenceStore } from '../store/presenceStore';

export function usePrivateSocket() {
  const token = useAuthStore(s => s.token);
  const addDMMessage = useChatStore(s => s.addDMMessage);
  const setTyping = useChatStore(s => s.setTyping);
  const updateMessageStatus = useChatStore(s => s.updateMessageStatus);
  const setOnline = usePresenceStore(s => s.setOnline);
  const setOffline = usePresenceStore(s => s.setOffline);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/private?token=${token}`
    );
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'private_message') {
        const otherId = data.sender_id === useAuthStore.getState().user?.id
          ? data.receiver_id : data.sender_id;
        addDMMessage(otherId, data);
      }
      if (data.type === 'typing') {
        setTyping(`dm_${data.from}`, [String(data.from)]);
        setTimeout(() => setTyping(`dm_${data.from}`, []), 3000);
      }
      if (data.type === 'read_receipt') {
        updateMessageStatus(data.receiver_id || data.from || 0, data.message_id, data.status);
      }
      if (data.type === 'presence') {
        if (data.status === 'online') setOnline(data.user_id);
        if (data.status === 'offline') setOffline(data.user_id);
      }
    };

    ws.onerror = () => console.error('Private WS error');
    return () => ws.close();
  }, [token, addDMMessage, setTyping, updateMessageStatus, setOnline, setOffline]);

  const sendDM = useCallback((receiverId: number, content: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'message', receiver_id: receiverId, content
    }));
  }, []);

  const sendTyping = useCallback((receiverId: number) => {
    wsRef.current?.send(JSON.stringify({ type: 'typing', receiver_id: receiverId }));
  }, []);

  const sendRead = useCallback((messageId: number) => {
    wsRef.current?.send(JSON.stringify({ type: 'read', message_id: messageId }));
  }, []);

  return { sendDM, sendTyping, sendRead };
}
