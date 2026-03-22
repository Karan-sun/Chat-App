import { useChats } from '../api/queries';
import { useChatStore } from '../store/useChatStore';
import { useAuth } from '../contexts/AuthContext';
import { Search, MessageSquarePlus, MoreVertical, CircleDashed } from 'lucide-react';

export default function Sidebar() {
    const { data: onlineUsers, isLoading } = useChats();
    const { activeUserId, setActiveUser } = useChatStore();
    const { user } = useAuth();

    return (
        <aside className="w-80 md:w-96 h-full bg-zinc-900/60 backdrop-blur-xl border-r border-white/5 flex flex-col z-20 flex-shrink-0">
            {/* Header Profile */}
            <div className="h-16 flex items-center justify-between px-4 bg-zinc-900/80 border-b border-white/5">
                <div className="flex items-center cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 mr-3 relative shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#18181b] bg-green-500"></span>
                    </div>
                    <h1 className="font-bold text-white tracking-wide">Chats</h1>
                </div>
                <div className="flex space-x-3 text-zinc-400">
                    <button className="hover:text-white transition-colors"><CircleDashed className="w-5 h-5" /></button>
                    <button className="hover:text-white transition-colors"><MessageSquarePlus className="w-5 h-5" /></button>
                    <button className="hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-white/5">
                <div className="bg-zinc-800/80 rounded-lg flex items-center px-3 py-1.5 border border-zinc-700/50 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                    <Search className="w-4 h-4 text-zinc-500 mr-2" />
                    <input type="text" placeholder="Search or start new chat" className="bg-transparent w-full focus:outline-none text-sm text-white placeholder-zinc-500" />
                </div>
            </div>

            {/* Chat List Items */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {isLoading ? (
                    <div className="text-center text-zinc-500 text-sm mt-8">Loading chats...</div>
                ) : (
                    <div className="space-y-1">
                        {/* Online Users Map */}
                        {onlineUsers?.online_users?.map((ouId: number) => {
                            if (ouId === user?.id) return null; // don't show self
                            const isActive = activeUserId === ouId;
                            return (
                                <div
                                    key={ouId}
                                    onClick={() => setActiveUser(ouId)}
                                    className={`flex items-center px-4 py-3 cursor-pointer transition-all group ${isActive ? 'bg-white/5 border-l-2 border-indigo-500' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 mr-4 flex-shrink-0 relative">
                                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#18181b] bg-green-500"></span>
                                    </div>
                                    <div className="flex-1 min-w-0 border-b border-white/5 pb-2 pt-1 border-transparent">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h2 className="text-white font-semibold truncate group-hover:text-indigo-400 transition-colors">User {ouId}</h2>
                                            <span className="text-xs text-zinc-500">Now</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <p className="text-zinc-500 truncate">Tap to chat</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}
