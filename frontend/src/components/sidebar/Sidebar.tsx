import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarHeader } from './SidebarHeader';
import { SidebarToggle } from './SidebarToggle';
import { RoomListView } from './RoomList';
import { DMListView } from './DMList';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDM = location.pathname.includes('/chat/dm');
  
  const [activeTab, setActiveTab] = useState<'rooms' | 'dm'>(isDM ? 'dm' : 'rooms');

  useEffect(() => {
    setActiveTab(location.pathname.includes('/chat/dm') ? 'dm' : 'rooms');
  }, [location.pathname]);

  const handleTabChange = (tab: 'rooms' | 'dm') => {
    setActiveTab(tab);
    navigate(`/chat/${tab}`);
  };

  return (
    <div className="flex flex-col h-full w-72 bg-anime-panel border-r border-anime-border shrink-0 z-20 shadow-xl overflow-hidden">
      <SidebarHeader />
      <SidebarToggle activeTab={activeTab} setActiveTab={handleTabChange} />
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'rooms' ? <RoomListView /> : <DMListView />}
      </div>
    </div>
  );
}
