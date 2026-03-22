export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-anime-muted p-8 text-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-40 mb-6 drop-shadow-md">
        <circle cx="50" cy="30" r="15" fill="currentColor" />
        <polygon points="50,45 20,90 80,90" fill="currentColor" />
        <circle cx="45" cy="28" r="3" fill="#111118" />
        <circle cx="55" cy="28" r="3" fill="#111118" />
      </svg>
      <h2 className="font-bangers text-3xl tracking-wide text-anime-muted/80">
        No messages yet.<br/>Start the battle!
      </h2>
    </div>
  );
}
