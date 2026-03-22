import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar/Sidebar';
import { usePrivateSocket } from '../hooks/usePrivateSocket';
import { usePresenceStore } from '../store/presenceStore';
import { getOnlineUsers } from '../api/dmApi';
import { useQuery } from '@tanstack/react-query';

export function ChatLayout() {
  // Initialize singleton private WS hook (handles typing, DM receives, presence updates)
  const socketHandlers = usePrivateSocket();

  const setOnlineUsers = usePresenceStore(s => s.setOnlineUsers);

  // Poll for online users every 30s as a fallback
  useQuery({
    queryKey: ['online-users'],
    queryFn: async () => {
      const data = await getOnlineUsers();
      if (data && data.online_users) {
        setOnlineUsers(data.online_users);
      }
      return data;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="flex h-screen w-full bg-anime-bg overflow-hidden font-nunito text-foreground selection:bg-anime-orange/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] relative z-0 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,107,0,1) 40px, rgba(255,107,0,1) 42px)`
        }}></div>
        <div className="flex-1 relative z-10 flex flex-col h-full bg-gradient-to-b from-transparent to-anime-bg/90">
          <Outlet context={socketHandlers} />
        </div>
      </div>
    </div>
  );
}
