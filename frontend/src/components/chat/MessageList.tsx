import { useEffect, useRef, useState, memo } from 'react';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from '../ui/EmptyState';
import { format } from 'date-fns';

export const MessageList = memo(function MessageList({ messages, isDM, currentUserId }: { messages: any[], isDM?: boolean, currentUserId: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const dateGroups: { [key: string]: any[] } = {};
  messages.forEach(msg => {
    const d = new Date(msg.timestamp);
    const dateKey = format(d, 'MMM d, yyyy');
    if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
    dateGroups[dateKey].push(msg);
  });

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (shouldAutoScroll !== isAtBottom) {
        setShouldAutoScroll(isAtBottom);
      }
    }
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  if (messages.length === 0) return <EmptyState />;

  return (
    <div 
      ref={scrollRef} 
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col pt-10 relative z-0"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {Object.entries(dateGroups).map(([date, msgs]) => (
          <div key={date} className="w-full flex flex-col mb-4">
            <div className="text-center my-6 sticky top-0 z-10 w-full flex justify-center">
              <span className="bg-anime-panel/90 backdrop-blur-sm text-anime-muted text-[11px] font-bold px-3 py-1 rounded-full border border-anime-border shadow-sm tracking-wider">
                {date}
              </span>
            </div>
            
            {msgs.map((msg, i) => {
              const isMine = msg.sender_id === currentUserId || msg.user_id === currentUserId;
              let showAvatar = true;
              
              if (i > 0) {
                const prev = msgs[i-1];
                const prevMine = prev.sender_id === currentUserId || prev.user_id === currentUserId;
                const sameUser = isDM 
                  ? msg.sender_id === prev.sender_id 
                  : msg.user_id === prev.user_id;
                  
                const timeDiff = new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime();
                if (sameUser && isMine === prevMine && timeDiff < 120000) {
                  showAvatar = false;
                }
              }

              return (
                <MessageBubble 
                  key={msg.id || `temp-${msg.timestamp}`} 
                  msg={msg} 
                  isMine={isMine} 
                  showAvatar={showAvatar} 
                  isDM={isDM} 
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
