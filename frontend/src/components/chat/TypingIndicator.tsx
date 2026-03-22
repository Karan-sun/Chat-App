export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;
  const text = users.length === 1 ? `${users[0]} is typing` : 'Several shinobi are typing';
  
  return (
    <div className="px-6 py-2 flex items-center gap-2 text-anime-muted text-sm transition-opacity duration-300">
      <span className="italic">{text}</span>
      <div className="flex gap-1 mt-1">
        <span className="w-1.5 h-1.5 bg-anime-muted rounded-full animate-[bounce_1s_infinite_0s]"></span>
        <span className="w-1.5 h-1.5 bg-anime-muted rounded-full animate-[bounce_1s_infinite_0.16s]"></span>
        <span className="w-1.5 h-1.5 bg-anime-muted rounded-full animate-[bounce_1s_infinite_0.32s]"></span>
      </div>
    </div>
  );
}
