import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function Logo({ phase }) {
  return (
    <div className="relative overflow-hidden">
      <h1
        className="ty-display text-5xl md:text-7xl lg:text-8xl font-bold text-white"
        style={{ letterSpacing: '0.18em', animation: 'logo-reveal 0.9s ease-out forwards' }}
      >
        TYMOTORS
      </h1>
      <div
        className={`pointer-events-none absolute inset-y-0 w-1/2 ${phase >= 1 ? 'animate-red-sweep' : 'opacity-0 -translate-x-full'}`}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(225,6,0,0.55) 45%, rgba(255,26,18,0.85) 50%, rgba(225,6,0,0.55) 55%, transparent 100%)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

function progressScale(phase) {
  if (phase === 0) return 0.15;
  if (phase === 1) return 0.8;
  return 1;
}

export function Loader({ onDone }) {
  const [phase, setPhase] = useState(0); // 0: reveal, 1: sweep, 2: out
  const { t } = useTranslation();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      const t0 = setTimeout(() => onDone?.(), 200);
      return () => clearTimeout(t0);
    }
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => onDone?.(), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const isOut = phase === 2;

  return (
    <div
      data-testid="loader-overlay"
      className={`fixed inset-0 z-[100] bg-[#050608] flex items-center justify-center transition-opacity duration-500 ${isOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="absolute inset-0 ty-grid-lines opacity-[0.07]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F2C94C]/30 to-transparent" />

      <div className="relative px-6 text-center">
        <Logo phase={phase} />
        <p className="mt-4 font-mono text-[10px] tracking-[0.4em] uppercase text-[#F2C94C]/70">
          {t('loader.tagline')}
        </p>
        <div className="mt-6 mx-auto h-px w-40 bg-[#232B3A] overflow-hidden">
          <div
            className="h-full bg-[#E10600] origin-left"
            style={{ transform: `scaleX(${progressScale(phase)})`, transition: 'transform 0.9s ease-out' }}
          />
        </div>
      </div>
    </div>
  );
}
