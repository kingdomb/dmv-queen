import { ShieldCheck } from 'lucide-react';

// One source of truth for the wording — the business confirmed insurance only,
// so this deliberately does not claim "licensed" or "bonded".
const DEFAULT_LABEL = 'Insured';

// Each variant is tuned to the background it sits on.
const SHELL = {
  // Hero eyebrow — pairs with the "Royalty Standard Cleaning" pill on beige.
  hero: 'py-1.5 px-4 bg-white/80 border-royal-green/20 text-royal-dark text-xs md:text-sm font-bold shadow-sm backdrop-blur-sm',
  // Glass chip on the green contact panel.
  onGreen: 'py-1.5 px-3.5 bg-white/10 border-white/20 text-white text-xs font-semibold backdrop-blur-md',
  // Quiet chip in the dark footer.
  footer: 'py-1 px-3 bg-white/5 border-white/10 text-slate-300 text-[11px] md:text-xs font-semibold',
};

const ICON = {
  hero: 'text-royal-green',
  onGreen: 'text-royal-gold',
  footer: 'text-royal-gold',
};

export default function InsuredBadge({
  variant = 'hero',
  label = DEFAULT_LABEL,
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border tracking-wide uppercase ${SHELL[variant]} ${className}`}
    >
      <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${ICON[variant]}`} />
      {label}
    </span>
  );
}
