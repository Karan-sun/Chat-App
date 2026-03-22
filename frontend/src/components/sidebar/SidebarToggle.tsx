export function SidebarToggle({ activeTab, setActiveTab }: { activeTab: 'rooms' | 'dm', setActiveTab: (tab: 'rooms' | 'dm') => void }) {
  return (
    <div className="flex p-2 gap-1 bg-anime-bg/30 border-b border-anime-border shrink-0">
      <button 
        onClick={() => setActiveTab('rooms')} 
        className={`flex-1 py-1.5 text-xs tracking-wider font-bold rounded-lg transition-all ${activeTab === 'rooms' ? 'bg-anime-orange text-white shadow-md' : 'text-anime-muted hover:text-white hover:bg-white/5'}`}
      >
        ROOMS
      </button>
      <button 
        onClick={() => setActiveTab('dm')} 
        className={`flex-1 py-1.5 text-xs tracking-wider font-bold rounded-lg transition-all ${activeTab === 'dm' ? 'bg-anime-orange text-white shadow-md' : 'text-anime-muted hover:text-white hover:bg-white/5'}`}
      >
        DIRECT
      </button>
    </div>
  );
}
