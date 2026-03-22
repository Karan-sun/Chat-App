import { Check, CheckCheck } from 'lucide-react';

export function ReadReceipt({ status }: { status?: 'SENT' | 'DELIVERED' | 'READ' }) {
  if (!status) return null;
  if (status === 'SENT') return <Check size={14} className="text-anime-muted ml-1" />;
  if (status === 'DELIVERED') return <CheckCheck size={14} className="text-anime-muted ml-1" />;
  if (status === 'READ') return <CheckCheck size={14} className="text-anime-blue ml-1" />;
  return null;
}
