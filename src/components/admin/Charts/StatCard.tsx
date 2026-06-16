import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accentColor,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 flex items-start gap-4 transition-all duration-150 hover:-translate-y-px hover:shadow-md group">
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 opacity-70"
        style={{ background: accentColor }}
      />
      {/* Icon bubble */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}
      >
        <Icon size={18} />
      </div>
      {/* Body */}
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
        <span className="block text-2xl font-bold text-foreground leading-tight tracking-tight">{value}</span>
        {sub && <span className="block text-xs text-muted-foreground mt-1">{sub}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold mt-1.5 px-1.5 py-0.5 rounded ${
              trend.up
                ? 'bg-vault-unlocked/10 text-vault-unlocked'
                : 'bg-vault-locked/10 text-vault-locked'
            }`}
          >
            {trend.up ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
