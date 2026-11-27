import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface GalaxyBrandSplashProps {
  visible: boolean;
  onDismiss: () => void;
  language: 'en' | 'te';
}

interface StarParticle {
  angle: number;
  radius: number;
  arm: number;
  size: number;
  speed: number;
  zOffset: number;
  color: string;
  alpha: number;
}

const BRAND_LETTERS = 'GURU PADUKAM'.split('');

export const GalaxyBrandSplash: React.FC<GalaxyBrandSplashProps> = ({
  visible,
  onDismiss,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'text' | 'galaxy'>('text');

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const phaseTimer = window.setTimeout(() => setPhase('galaxy'), 1100);
    const dismissTimer = window.setTimeout(() => onDismiss(), 4400);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(phaseTimer);
      window.clearTimeout(dismissTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, onDismiss]);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const palette = [
      '#D4AF37', // sacred gold
      '#F3E5AB', // pale gold
      '#8B5CF6', // cosmic violet
      '#6366F1', // deep indigo
      '#A855F7', // nebula purple
      '#38BDF8', // starlight blue
    ];

    const arms = 4;
    const particles: StarParticle[] = Array.from({ length: 750 }, (_, i) => {
      const arm = i % arms;
      const radius = Math.pow(Math.random(), 0.72) * Math.min(window.innerWidth, window.innerHeight) * 0.46;
      const spinAngle = radius * 0.015;
      const armAngle = (arm / arms) * Math.PI * 2;
      const scatter = (Math.random() - 0.5) * (0.45 + radius * 0.0012);
      return {
        angle: armAngle + spinAngle + scatter,
        radius,
        arm,
        size: 0.9 + Math.random() * 2.2,
        speed: 0.0022 + (1 - Math.min(radius / 420, 0.9)) * 0.0045,
        zOffset: (Math.random() - 0.5) * 90,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.35 + Math.random() * 0.65,
      };
    });

    // Background twinkling stars
    const bgStars = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 1.4,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const render = () => {
      t += 0.016;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#05040B';
      ctx.fillRect(0, 0, w, h);

      // Subtle radial cosmic core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, Math.min(w, h) * 0.45);
      coreGrad.addColorStop(0, 'rgba(212, 175, 55, 0.22)');
      coreGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.14)');
      coreGrad.addColorStop(0.7, 'rgba(88, 28, 135, 0.08)');
      coreGrad.addColorStop(1, 'rgba(5, 4, 11, 0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, w, h);

      // Twinkling distant stars
      for (const s of bgStars) {
        const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 1.4 + s.twinkle));
        ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3D tilted spiral galaxy projection
      const tilt = 0.52; // 3D inclination
      const fov = 520;
      for (const p of particles) {
        p.angle += p.speed;
        const x3d = Math.cos(p.angle) * p.radius;
        const y3d = Math.sin(p.angle) * p.radius * tilt;
        const z3d = Math.sin(p.angle) * p.radius * 0.35 + p.zOffset;

        const scale = fov / (fov + z3d + 160);
        const sx = cx + x3d * scale;
        const sy = cy + y3d * scale;
        const r = Math.max(0.5, p.size * scale);

        ctx.globalAlpha = Math.min(1, p.alpha * scale);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-[#05040B] flex flex-col items-center justify-center overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Guru Padukam"
      onClick={onDismiss}
    >
      {/* 3D Galaxy Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Skip / Close Button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        aria-label="Skip intro"
        className="absolute top-6 right-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-cinzel tracking-widest uppercase text-cream transition-colors"
      >
        Skip <X size={14} />
      </button>

      {/* Center Stage: 3D Emblem + Staggered Kinetic Brand Typography */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 3D Rotating Guru Padukam Emblem */}
        <div
          className={`transition-all duration-1000 ease-out mb-7 ${
            phase === 'galaxy' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ perspective: '900px' }}
        >
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            {/* Orbital Gold Halo */}
            <div
              className="absolute inset-0 rounded-full border border-gold/50 shadow-[0_0_50px_rgba(212,175,55,0.45)] animate-spin"
              style={{ animationDuration: '9s' }}
            />
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-gold via-gold-pale to-maroon shadow-[0_0_40px_rgba(212,175,55,0.55)]"
              style={{
                animation: 'gpEmblem3D 4.2s ease-in-out infinite',
                transformStyle: 'preserve-3d',
              }}
            >
              <img
                src="/logo.png"
                alt="Guru Padukam Emblem"
                className="w-full h-full rounded-full object-cover bg-cream"
              />
            </div>
          </div>
        </div>

        {/* Staggered Kinetic Typography (VEIXO-style masked rise) */}
        <h1 className="flex flex-wrap justify-center overflow-hidden font-cinzelDeco font-black tracking-[0.14em] text-3xl sm:text-5xl md:text-6xl text-white drop-shadow-[0_6px_30px_rgba(212,175,55,0.35)]">
          {BRAND_LETTERS.map((char, idx) => (
            <span
              key={idx}
              className="inline-block"
              style={{
                animation: 'gpLetterRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                animationDelay: `${idx * 45}ms`,
                opacity: 0,
                transform: 'translateY(115%)',
                minWidth: char === ' ' ? '0.45em' : undefined,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <p
          className={`mt-4 font-cinzel text-xs sm:text-sm tracking-[0.35em] uppercase text-gold-lt transition-all duration-1000 ${
            phase === 'galaxy' ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {language === 'te' ? 'ॐ శ్రీ గురుభ్యో నమః · పవిత్ర వేద సేవలు' : 'ॐ श्री गुरुभ्यो नमः · Sacred Vedic Flow'}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className={`mt-8 px-7 py-2.5 rounded-full bg-gradient-to-r from-gold via-gold-lt to-gold text-maroon-dk font-cinzel font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:brightness-110 transition-all duration-700 ${
            phase === 'galaxy' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {language === 'te' ? 'ప్రవేశించండి →' : 'Enter Guru Padukam →'}
        </button>
      </div>

      <style>{`
        @keyframes gpLetterRise {
          0% {
            opacity: 0;
            transform: translateY(115%) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0%) scale(1);
          }
        }
        @keyframes gpEmblem3D {
          0% {
            transform: rotateY(-18deg) rotateX(8deg) scale(0.96);
          }
          50% {
            transform: rotateY(18deg) rotateX(-6deg) scale(1.04);
          }
          100% {
            transform: rotateY(-18deg) rotateX(8deg) scale(0.96);
          }
        }
      `}</style>
    </div>
  );
};
