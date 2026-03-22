import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export function MessageInput({ onSend, onTyping }: { onSend: (content: string) => void, onTyping: () => void }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        onSend(content.trim());
        setContent('');
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping();
  };

  return (
    <div className="p-4 bg-anime-panel/80 backdrop-blur-md border-t border-anime-border shrink-0 z-10">
      <div className="relative flex items-end gap-2 max-w-5xl mx-auto">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Send a message..."
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-anime-card bg-opacity-80 border border-anime-border rounded-xl px-4 py-3 min-h-[48px] max-h-[120px] resize-none text-white focus:outline-none focus:border-anime-orange focus:ring-1 focus:ring-anime-orangeGlow placeholder-anime-muted/50 transition-all custom-scrollbar overflow-y-auto"
        />
        <button 
          onClick={() => { if(content.trim()){ onSend(content.trim()); setContent(''); } }}
          disabled={!content.trim()}
          className="bg-anime-orange text-white h-[48px] w-[48px] rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-[var(--glow)]"
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}
