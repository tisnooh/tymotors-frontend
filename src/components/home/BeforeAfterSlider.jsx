import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/shared/Reveal';

const BEFORE_IMG = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2000&q=85';
const AFTER_IMG = 'https://images.unsplash.com/photo-1621776887753-fe3c3239555a?auto=format&fit=crop&w=2000&q=85';
const TICK_KEYS = Array.from({ length: 12 }, (_, i) => `tick-${i}`);

function TelemetryTicks() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-between px-3 opacity-60">
      {TICK_KEYS.map((k) => <span key={k} className="h-2 w-px bg-[#F2C94C]/60" />)}
    </div>
  );
}

export function BeforeAfterSlider() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const draggingRef = useRef(false);

  const handleMove = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [handleMove]);

  return (
    <section data-testid="before-after-section" className="relative ty-section bg-[#070809]">
      <div className="ty-container">
        <Reveal className="mb-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('before_after.eyebrow')}
              </p>
              <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('before_after.title')}</h2>
            </div>
            <p className="text-ty-textMid max-w-md text-sm md:text-base">{t('before_after.sub')}</p>
          </div>
        </Reveal>

        <Reveal>
          <div
            ref={containerRef}
            data-testid="before-after-slider"
            role="slider"
            tabIndex={0}
            aria-valuenow={Math.round(pos)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#151A23] cursor-ew-resize select-none"
            onMouseDown={(e) => { draggingRef.current = true; handleMove(e.clientX); }}
            onTouchStart={(e) => { draggingRef.current = true; handleMove(e.touches[0].clientX); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
              if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
            }}
          >
            <img src={AFTER_IMG} alt="After" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute top-4 right-4 ty-chip ty-chip-red font-mono">{t('before_after.after')}</div>

            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <img src={BEFORE_IMG} alt="Before" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute top-4 left-4 ty-chip font-mono">{t('before_after.before')}</div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050608]/40 via-transparent to-[#050608]/30" />

            <div data-testid="before-after-handle" className="ty-ba-handle" style={{ left: `${pos}%` }} />
            <TelemetryTicks />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
