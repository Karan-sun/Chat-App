import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRoomMessages, getRooms } from '../../api/chatApi';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useRoomSocket } from '../../hooks/useRoomSocket';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Hash, Users } from 'lucide-react';

export function RoomChatView() {
  const { roomId } = useParams<{ roomId: string }>();
  const rId = parseInt(roomId!);
  const currentUserId = useAuthStore(s => s.user?.id) || 0;
  
  const setRoomMessages = useChatStore(s => s.setRoomMessages);
  const msgs = useChatStore(s => s.roomMessages[rId]) || [];
  const typing = useChatStore(s => s.typingUsers[`room_${rId}`]) || [];
  
  useQuery({
    queryKey: ['rooms', rId, 'messages'],
    queryFn: async () => {
      const data = await getRoomMessages(rId);
      setRoomMessages(rId, data);
      return data;
    },
    enabled: !!rId
  });

  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: getRooms });
  const room = rooms?.find((r: any) => r.id === rId);

  const { sendMessage, sendTyping } = useRoomSocket(rId);

  return (
    <div className="flex flex-col h-full bg-anime-bg">
      <div className="h-[68px] px-6 bg-anime-panel/90 backdrop-blur-md border-b border-anime-border flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-anime-card to-anime-bg flex items-center justify-center border border-anime-border shadow-inner">
            <Hash className="text-anime-orange" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-wider flex items-center gap-2">{room?.name || 'Joining Server...'}</h2>
            <div className="flex items-center text-anime-muted text-xs gap-1.5 opacity-80 mt-0.5 font-semibold">
              <Users size={12} /> PUBLIC NETWORK 
            </div>
          </div>
        </div>
      </div>
      
      <MessageList messages={msgs} isDM={false} currentUserId={currentUserId} />
      
      <div className="w-full max-w-5xl mx-auto"><TypingIndicator users={typing.filter(u => u !== String(currentUserId))} /></div>
      <MessageInput onSend={sendMessage} onTyping={sendTyping} />
    </div>
  );
}
