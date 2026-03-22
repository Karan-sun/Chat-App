import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getContacts, searchUsers } from '../../api/dmApi';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { OnlineDot } from '../ui/OnlineDot';
import { usePresenceStore } from '../../store/presenceStore';
import { Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function DMListView() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { userId } = useParams();
  const navigate = useNavigate();
  const onlineUsers = usePresenceStore(s => s.onlineUsers);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
    refetchInterval: 30000,
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="flex flex-col h-full bg-anime-panel/50">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!isSearching ? (
          <>
            {contactsLoading && <p className="text-anime-muted text-sm text-center mt-4 font-mono animate-pulse">Loading intel...</p>}
            {contacts.map((contact: any) => {
              const isActive = userId === String(contact.user_id);
              const isOnline = onlineUsers.has(contact.user_id);
              return (
                <div 
                  key={contact.user_id}
                  onClick={() => navigate(`/chat/dm/${contact.user_id}`)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-anime-card border-l-[3px] border-anime-purple text-white sidebar-active' : 'text-anime-muted hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="relative">
                    <Avatar username={contact.username} size="md" />
                    {isOnline && <OnlineDot />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold truncate text-sm text-anime-purple drop-shadow-sm">{contact.username}</span>
                      <span className="text-[10px] opacity-70 whitespace-nowrap ml-2">
                        {contact.last_timestamp && formatDistanceToNow(new Date(contact.last_timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs truncate opacity-80">{contact.last_message}</p>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="space-y-1">
            <div className="px-3 py-1 mb-2">
              <span className="text-xs font-bold text-anime-purple tracking-wider drop-shadow-sm">SEARCH RESULTS</span>
            </div>
            {searchLoading && <p className="text-anime-muted text-sm text-center mt-2 font-mono animate-pulse">Scanning...</p>}
            {searchResults.map((user: any) => (
              <div 
                key={user.id}
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                  navigate(`/chat/dm/${user.id}`);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all text-anime-muted hover:bg-white/5 hover:text-white group"
              >
                <Avatar username={user.username} size="sm" />
                <span className="font-semibold truncate text-sm group-hover:text-anime-purple transition-colors drop-shadow-sm">{user.username}</span>
              </div>
            ))}
            {searchResults.length === 0 && debouncedQuery && !searchLoading && (
              <p className="text-anime-muted text-sm text-center mt-4">No shinobi found</p>
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-anime-border bg-anime-panel shrink-0 shadow-lg z-10 transition-all">
        {isSearching ? (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-anime-muted" size={16} />
              <input 
                autoFocus
                type="text" 
                placeholder="Find shinobi..."
                className="w-full bg-anime-bg border border-anime-border rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-anime-purple focus:ring-1 focus:ring-anime-purple/30 outline-none transition-all placeholder-anime-muted/50"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setIsSearching(false); setSearchQuery(''); }}
              className="w-full text-anime-muted hover:text-white text-sm py-1.5 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsSearching(true)}
            className="w-full flex items-center justify-center gap-2 text-anime-purple hover:text-white hover:bg-anime-purple shadow-sm shadow-anime-purple/10 py-2.5 rounded-xl transition-all font-bold text-sm tracking-wide border border-dashed border-anime-purple/40 hover:border-anime-purple hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]"
          >
            <Plus size={16} /> NEW MESSAGE
          </button>
        )}
      </div>
    </div>
  );
}
