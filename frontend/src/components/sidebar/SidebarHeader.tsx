import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SidebarHeader() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-anime-border bg-anime-panel shrink-0 shadow-sm relative z-10">
      <div className="flex items-center gap-3">
        {user && <Avatar username={user.username} size="md" />}
        <h1 className="font-bangers text-2xl text-anime-orange tracking-widest mt-1 drop-shadow-sm">AniChat</h1>
      </div>
      <button 
        onClick={handleLogout} 
        className="text-anime-muted hover:text-anime-danger transition-colors p-2 rounded-xl hover:bg-white/5" 
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
