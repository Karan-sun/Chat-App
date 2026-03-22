import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { register, login, getMe } from '../api/authApi';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await register({ username, email, password });
      
      const res = await login({ email, password });
      useAuthStore.setState({ token: res.access_token });
      const user = await getMe();
      setAuth(user, res.access_token);
      navigate('/chat');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') setError(detail);
      else if (Array.isArray(detail)) setError(detail[0]?.msg || 'Validation Error');
      else setError('Registration failed');
    }
  };

  return (
    <div className="flex bg-anime-bg min-h-screen items-center justify-center p-4 relative" style={{
      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,107,0,0.03) 40px, rgba(255,107,0,0.03) 42px)`
    }}>
      <div className="bg-anime-card rounded-2xl shadow-2xl p-8 max-w-md w-full border border-anime-border relative overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="font-bangers text-5xl text-anime-orange tracking-wider drop-shadow-lg">AniChat</h1>
          <p className="text-anime-muted mt-2 font-nunito font-semibold">Create your ninja profile!</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10 font-nunito">
          <div>
            <input 
              type="text" 
              placeholder="Username"
              className="w-full bg-anime-panel border border-anime-border rounded-xl px-4 py-3 text-white placeholder-anime-muted focus:border-anime-orange focus:ring-1 focus:ring-anime-orangeGlow outline-none transition-all"
              value={username} onChange={e => setUsername(e.target.value)} required 
            />
          </div>
          <div>
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-anime-panel border border-anime-border rounded-xl px-4 py-3 text-white placeholder-anime-muted focus:border-anime-orange focus:ring-1 focus:ring-anime-orangeGlow outline-none transition-all"
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-anime-panel border border-anime-border rounded-xl px-4 py-3 text-white placeholder-anime-muted focus:border-anime-orange focus:ring-1 focus:ring-anime-orangeGlow outline-none transition-all"
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
          </div>
          {error && <p className="text-anime-danger text-sm mt-1">{error}</p>}
          <button type="submit" className="mt-6 bg-anime-orange hover:brightness-110 text-white font-bold rounded-xl py-3 transition-all active:scale-95 shadow-[var(--glow)] tracking-wide">
            REGISTER
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-anime-muted font-nunito">
          Already have an account? <a href="/login" className="text-anime-orange hover:underline font-semibold tracking-wide">Login</a>
        </p>
      </div>
    </div>
  );
}
