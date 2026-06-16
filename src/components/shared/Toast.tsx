import { RiAlertLine, RiCheckLine } from 'react-icons/ri';

export function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-60 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-fade-in ${
        type === 'success'
          ? 'bg-card border-vault-unlocked/30 text-vault-unlocked'
          : 'bg-card border-destructive/30 text-destructive'
      }`}
    >
      {type === 'success' ? <RiCheckLine size={16} /> : <RiAlertLine size={16} />}
      {msg}
    </div>
  );
}
