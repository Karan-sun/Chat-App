export function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-anime-orange text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-mono shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
}
