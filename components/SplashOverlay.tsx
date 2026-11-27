import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SplashFeatureItem {
  icon: string;
  title: string;
  desc: string;
}

interface SplashOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  eyebrow: string;
  title: string;
  subtitle: string;
  features: SplashFeatureItem[];
  ctaLabel: string;
  autoDismissMs?: number;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({
  visible,
  onDismiss,
  eyebrow,
  title,
  subtitle,
  features,
  ctaLabel,
  autoDismissMs,
}) => {
  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, onDismiss]);

  useEffect(() => {
    if (!visible || !autoDismissMs) return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [visible, autoDismissMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[270] bg-maroon-dk/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="max-w-lg w-full bg-cream border-2 border-gold/60 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Crest */}
        <div className="bg-gradient-to-b from-maroon-dk via-maroon to-maroon-dk px-6 pt-7 pb-6 text-center text-cream relative">
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close intro"
            className="absolute top-3.5 right-3.5 text-cream/70 hover:text-gold transition-colors"
          >
            <X size={20} />
          </button>

          <img
            src="/logo.png"
            alt="Guru Padukam"
            className="w-16 h-16 mx-auto rounded-full border-2 border-gold bg-cream object-cover p-0.5 shadow-xl mb-3"
          />
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gold-lt">
            {eyebrow}
          </p>
          <h2 className="font-serif text-2xl sm:text-[1.65rem] font-bold text-cream mt-1 leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-[13px] text-cream/85 mt-1.5 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Simple High-Impact Highlights */}
        <div className="p-5 sm:p-6 space-y-3">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gold/25 shadow-sm">
              <span className="text-xl shrink-0 leading-none mt-0.5">{f.icon}</span>
              <div>
                <div className="text-xs font-bold text-maroon">{f.title}</div>
                <div className="text-[11px] text-text-md mt-0.5 leading-snug">{f.desc}</div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onDismiss}
            className="w-full mt-2 py-3 bg-gradient-to-r from-maroon-dk via-maroon to-maroon-dk text-gold-pale font-cinzel text-xs font-bold uppercase tracking-widest rounded-lg shadow hover:brightness-110 transition-all"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
