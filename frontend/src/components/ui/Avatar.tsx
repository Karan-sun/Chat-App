const colors = ['#ff6b00', '#00a8ff', '#8b5cf6', '#22c55e', '#ef4444'];

const getHashColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function Avatar({ username, size = 'md' }: { username: string, size?: 'sm'|'md'|'lg' }) {
  const sizeMap = { 
    sm: 'w-[28px] h-[28px] text-xs', 
    md: 'w-[36px] h-[36px] text-sm', 
    lg: 'w-[44px] h-[44px] text-base' 
  };
  
  const initials = username.slice(0, 2).toUpperCase();
  const bgColor = getHashColor(username);

  return (
    <div 
      className={`relative rounded-full flex items-center justify-center text-white font-bangers shadow-sm z-0 ${sizeMap[size]}`} 
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
