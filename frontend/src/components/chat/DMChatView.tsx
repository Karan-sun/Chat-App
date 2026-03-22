import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDMHistory, getContacts } from '../../api/dmApi';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { usePresenceStore } from '../../store/presenceStore';
import { useOutletContext } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Avatar } from '../ui/Avatar';
import { OnlineDot } from '../ui/OnlineDot';

export function DMChatView() {
  const { userId } = useParams<{ userId: string }>();
  const dmId = parseInt(userId!);
  const currentUserId = useAuthStore(s => s.user?.id) || 0;
  
  const setDMMessages = useChatStore(s => s.setDMMessages);
  const msgs = useChatStore(s => s.dmMessages[dmId]) || [];
  const typing = useChatStore(s => s.typingUsers[`dm_${dmId}`]) || [];
  const updateMessagesStatus = useChatStore(s => s.updateMessagesStatus);

  const onlineUsers = usePresenceStore(s => s.onlineUsers);
  const isOnline = onlineUsers.has(dmId);
  
  const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: getContacts });
  const contact = contacts?.find((c: any) => c.user_id === dmId);
  const username = contact?.username || `User ${dmId}`;

  const { sendDM, sendTyping, sendRead } = useOutletContext<{ sendDM: any, sendTyping: any, sendRead: any }>();

  useQuery({
    queryKey: ['dm', dmId, 'messages'],
    queryFn: async () => {
      const data = await getDMHistory(dmId);
      setDMMessages(dmId, data);
      
      data.forEach((msg: any) => {
        if (msg.status !== 'READ' && msg.receiver_id === currentUserId) {
           sendRead(msg.id);
        }
      });
      return data;
    },
    enabled: !!dmId
  });

  useEffect(() => {
    const unreadMsgs = msgs.filter((m: any) => 
      m.status !== 'READ' && m.status !== 'read' && m.receiver_id === currentUserId
    );
    if (unreadMsgs.length > 0) {
      const msgIds = unreadMsgs.map((m: any) => m.id);
      msgIds.forEach(id => sendRead(id));
      updateMessagesStatus(dmId, msgIds, 'READ');
    }
  }, [msgs, currentUserId, dmId, sendRead, updateMessagesStatus]);

  return (
    <div className="flex flex-col h-full bg-anime-bg">
      <div className="h-[68px] px-6 bg-anime-panel/90 backdrop-blur-md border-b border-anime-border flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar username={username} size="md" />
            {isOnline && <OnlineDot />}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-wide">{username}</h2>
            <div className={`text-xs ${isOnline ? 'text-anime-online font-semibold drop-shadow-[0_0_2px_rgba(34,197,94,0.4)]' : 'text-anime-muted'} opacity-90 tracking-wide`}>
              {isOnline ? 'Online via Chakra Link' : 'Offline'}
            </div>
          </div>
        </div>
      </div>
      
      <MessageList messages={msgs} isDM={true} currentUserId={currentUserId} />
      
      <div className="w-full max-w-5xl mx-auto px-4"><TypingIndicator users={typing.length ? [username] : []} /></div>
      <MessageInput onSend={(c) => sendDM(dmId, c)} onTyping={() => sendTyping(dmId)} />
    </div>
  );
}
