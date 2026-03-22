import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
    sendPrivateMessage: (receiverId: number, content: string) => void;
    sendRoomMessage: (roomId: string, content: string) => void;
    sendTypingEvent: (receiverId?: number, roomId?: string) => void;
    markAsRead: (messageId: number) => void;
    registerListener: (type: string, callback: (data: any) => void) => void;
    unregisterListener: (type: string, callback: (data: any) => void) => void;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const listeners = useRef<Record<string, Array<(data: any) => void>>>({});

    useEffect(() => {
        if (!token || !user) return;

        ws.current = new WebSocket(`ws://localhost:8000/ws/private?token=${token}`);

        ws.current.onopen = () => setIsConnected(true);
        ws.current.onclose = () => setIsConnected(false);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const callbacks = listeners.current[data.type] || [];
            callbacks.forEach(cb => cb(data));
        };

        return () => {
            ws.current?.close();
        };
    }, [token, user]);

    const sendPrivateMessage = (receiverId: number, content: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'message', receiver_id: receiverId, content }));
        }
    };

    const sendRoomMessage = (_roomId: string, _content: string) => {
        // Needs distinct room WS logic or a multiplexed WS approach. We'll start with private for now.
    }

    const sendTypingEvent = (receiverId?: number) => {
        if (ws.current?.readyState === WebSocket.OPEN && receiverId) {
            ws.current.send(JSON.stringify({ type: 'typing', receiver_id: receiverId }));
        }
    };

    const markAsRead = (messageId: number) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'read', message_id: messageId }));
        }
    };

    const registerListener = (type: string, callback: (data: any) => void) => {
        if (!listeners.current[type]) listeners.current[type] = [];
        listeners.current[type].push(callback);
    };

    const unregisterListener = (type: string, callback: (data: any) => void) => {
        if (!listeners.current[type]) return;
        listeners.current[type] = listeners.current[type].filter(cb => cb !== callback);
    };

    return (
        <WebSocketContext.Provider value={{
            sendPrivateMessage, sendRoomMessage, sendTypingEvent, markAsRead,
            registerListener, unregisterListener, isConnected
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
    return context;
};
