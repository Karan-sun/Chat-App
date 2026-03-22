import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRooms, createRoom } from '../../api/chatApi';
import { useNavigate, useParams } from 'react-router-dom';
import { Hash, Plus } from 'lucide-react';

export function RoomListView() {
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const { roomId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsCreating(false);
      setNewRoomName('');
      navigate(`/chat/rooms/${newRoom.id}`);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      createMutation.mutate(newRoomName.trim());
    }
  };

  return (
    <div className="flex flex-col h-full bg-anime-panel/50">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && <p className="text-anime-muted text-sm text-center mt-4 font-mono animate-pulse">Scanning frequencies...</p>}
        {rooms.map((room: any) => {
          const isActive = roomId === String(room.id);
          return (
            <div 
              key={room.id}
              onClick={() => navigate(`/chat/rooms/${room.id}`)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-anime-card border-l-[3px] border-anime-orange text-white sidebar-active' : 'text-anime-muted hover:bg-white/5 hover:text-white'}`}
            >
              <Hash size={18} className={isActive ? 'text-anime-orange drop-shadow-md' : 'opacity-70'} />
              <span className="font-semibold truncate tracking-wide text-sm">{room.name}</span>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 border-t border-anime-border bg-anime-panel shrink-0 shadow-lg z-10">
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input 
              autoFocus
              type="text" 
              placeholder="Room name..."
              className="flex-1 bg-anime-bg border border-anime-border rounded-xl px-3 py-2 text-sm text-white focus:border-anime-orange focus:ring-1 focus:ring-anime-orangeGlow outline-none transition-all placeholder-anime-muted/50"
              value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
            />
            <button type="submit" disabled={createMutation.isPending} className="bg-anime-orange text-white px-3 py-2 rounded-xl text-sm font-bold shadow-[var(--glow)] hover:brightness-110 active:scale-95 transition-all">
              OK
            </button>
            <button type="button" onClick={() => setIsCreating(false)} className="px-2 text-anime-muted hover:text-white transition-colors">✕</button>
          </form>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 text-anime-orange hover:text-white hover:bg-anime-orange shadow-sm shadow-anime-orange/10 py-2.5 rounded-xl transition-all font-bold text-sm tracking-wide border border-dashed border-anime-orange/40 hover:border-anime-orange hover:shadow-[var(--glow)]"
          >
            <Plus size={16} /> NEW ROOM
          </button>
        )}
      </div>
    </div>
  );
}
