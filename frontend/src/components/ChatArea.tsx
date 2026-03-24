import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useWebSocket } from '../contexts/WebSocketContext';
import { usePrivateMessages } from '../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import MessageBubble from './MessageBubble';
import { Send, Smile, Paperclip, Video, Phone, Search, MoreVertical } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function ChatArea() {
    const { activeUserId } = useChatStore();
    const { data: initialMessages, isLoading } = usePrivateMessages(activeUserId);
    const { sendPrivateMessage, registerListener, unregisterListener } = useWebSocket();
    const queryClient = useQueryClient();
    const user = useAuthStore(s => s.user);

    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleNewMessage = (data: any) => {
            // Check if the message belongs to the current open chat
            if (
                data.sender_id === activeUserId ||
                data.receiver_id === activeUserId
            ) {
                setMessages(prev => {
                    const exists = prev.find(m => m.id === data.id);
                    if (exists) return prev;
                    return [...prev, data];
                });
            } else {
                if (user && data.sender_id !== user.id) {
                    toast.success(`New message from User ${data.sender_id}`);
                }
            }
            // invalidate queries to keep react-query cache fresh
            queryClient.invalidateQueries({ queryKey: ['messages', activeUserId] });
        };

        const handleReadReceipt = (data: any) => {
            setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, status: 'read' } : m));
        };

        registerListener('private_message', handleNewMessage);
        registerListener('read_receipt', handleReadReceipt);

        return () => {
            unregisterListener('private_message', handleNewMessage);
            unregisterListener('read_receipt', handleReadReceipt);
        };
    }, [activeUserId, registerListener, unregisterListener, queryClient, user]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setInputText(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeUserId) return;

        // 1. Optimistic Update (create fake message instantly)
        const tempMessage = {
            id: Date.now() * -1, // temporary negative ID
            content: inputText,
            sender_id: 'me', // we know it's us
            receiver_id: activeUserId,
            status: 'sending',
            timestamp: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages(prev => [...prev, tempMessage]);

        // 2. Actually send it via WS
        sendPrivateMessage(activeUserId, inputText);
        setInputText('');
    };

    if (!activeUserId) {
        return (
            <main className="flex-1 flex flex-col bg-[#09090b] items-center justify-center text-zinc-500">
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 opacity-50" />
                </div>
                <p>Select a chat or start a new conversation</p>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col bg-[#09090b] relative z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light" style={{ backgroundColor: '#09090b' }}>
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>

            {/* Chat Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-900/90 backdrop-blur-md absolute top-0 w-full z-10 shadow-sm cursor-pointer hover:bg-zinc-800/90 transition-colors">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 mr-4"></div>
                    <div>
                        <h2 className="font-bold text-white text-lg leading-tight">User {activeUserId}</h2>
                        <p className="text-xs text-indigo-400">Online</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6 text-zinc-400">
                    <button className="hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
                    <button className="hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
                    <div className="w-[1px] h-6 bg-zinc-700"></div>
                    <button className="hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
                    <button className="hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-20 pb-4 px-8 hide-scrollbar scroll-smooth relative z-10 flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Loading messages...</div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            id={msg.id}
                            content={msg.content}
                            isMe={msg.sender_id !== activeUserId} // if sender is not the OTHER person, it's us. (Or string 'me' from optimistic push)
                            status={msg.status}
                            timestamp={msg.timestamp}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 bg-zinc-900/90 backdrop-blur-md z-10 border-t border-white/5 flex items-center space-x-3 relative">
                <button className="text-zinc-400 hover:text-white transition-colors p-2"><Paperclip className="w-6 h-6" /></button>

                <div className="relative">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-zinc-400 hover:text-white transition-colors p-2">
                        <Smile className="w-6 h-6" />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 z-50 shadow-2xl">
                            <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="flex-1 flex">
                    <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center px-4 py-2 focus-within:border-indigo-500/50 shadow-inner">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message"
                            className="bg-transparent w-full focus:outline-none text-white placeholder-zinc-500 text-[15px]"
                        />
                    </div>

                    <button type="submit" disabled={!inputText.trim()} className="ml-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-2.5 rounded-full flex items-center justify-center transition-all shadow-lg shadow-indigo-500/30">
                        <Send className="w-5 h-5 -ml-0.5" />
                    </button>
                </form>
            </div>
        </main>
    );
}
