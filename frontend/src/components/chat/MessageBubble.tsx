import { Avatar } from '../ui/Avatar';
import { ReadReceipt } from './ReadReceipt';
import { format } from 'date-fns';

interface MessageBubbleProps {
  msg: any;
  isMine: boolean;
  showAvatar: boolean;
  isDM?: boolean;
}

export function MessageBubble({ msg, isMine, showAvatar, isDM }: MessageBubbleProps) {
  const time = format(new Date(msg.timestamp), 'HH:mm');

  if (isMine) {
    return (
      <div className={`flex justify-end msg-bubble w-full ${showAvatar ? 'mt-4' : 'mt-1'}`}>
        <div className="flex flex-col items-end">
          <div className="bg-[#ff6b00]/20 border border-[#ff6b00]/30 rounded-3xl rounded-tr-sm px-4 py-2.5 max-w-xs md:max-w-md lg:max-w-lg text-white shadow-sm font-sans text-[15px] leading-relaxed break-words">
            {msg.content}
          </div>
          <div className="flex items-center mt-1">
            <span className="text-[11px] text-anime-muted font-mono tracking-widest">{time}</span>
            {isDM && <ReadReceipt status={msg.status} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-start gap-3 msg-bubble w-full ${showAvatar ? 'mt-4' : 'mt-1'}`}>
      <div className="w-[36px] shrink-0 mt-auto mb-5">
        {showAvatar && <Avatar username={msg.username || 'User'} size="md" />}
      </div>
      <div className="flex flex-col items-start min-w-0">
        {showAvatar && !isDM && (
          <span className="text-xs text-anime-blue font-bold mb-1 ml-1 tracking-wide">{msg.username}</span>
        )}
        <div className="bg-anime-card border border-anime-border rounded-3xl rounded-tl-sm px-4 py-2.5 max-w-xs md:max-w-md lg:max-w-lg text-white shadow-sm font-sans text-[15px] leading-relaxed break-words">
          {msg.content}
        </div>
        <div className="mt-1 ml-1 text-[11px] text-anime-muted font-mono tracking-widest">
          {time}
        </div>
      </div>
    </div>
  );
}
