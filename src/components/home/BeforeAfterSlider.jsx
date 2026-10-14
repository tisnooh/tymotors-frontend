import React, { useCallback, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/shared/Reveal';

const TICK_KEYS = Array.from({ length: 12 }, (_, i) => `tick-${i}`);
const imageProps = variant => ({
  src: `/images/transformations/front-${variant}-v1-960.webp`,
  srcSet: [480, 960, 1672].map(width => `/images/transformations/front-${variant}-v1-${width}.webp ${width}w`).join(', '),
  sizes: '(min-width: 1280px) 1200px, (min-width: 1024px) calc(100vw - 80px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)',
  width: 1672, height: 941,
});
const BEFORE_IMAGE = imageProps('stock');
const AFTER_IMAGE = imageProps('tuned');

function TelemetryTicks() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-between px-3 opacity-60">
      {TICK_KEYS.map((k) => <span key={k} className="h-2 w-px bg-[#F2C94C]/60" />)}
    </div>
  );
}

export function BeforeAfterSlider() {
  const { t } = useTranslation();
  const id = useId();
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const [loaded, setLoaded] = useState({ before: false, after: false });
  const [imageError, setImageError] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const draggingRef = useRef(false);
  const ready = loaded.before && loaded.after && !imageError;

  const handleMove = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  const stopDragging = event => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section data-testid="before-after-section" className="relative ty-section bg-[#070809]" aria-labelledby={`${id}-title`}>
      <div className="ty-container">
        <Reveal className="home-section-heading">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('before_after.eyebrow')}
              </p>
              <h2 id={`${id}-title`} className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('before_after.title')}</h2>
            </div>
            <p id={`${id}-hint`} className="text-ty-textMid max-w-md text-sm md:text-base">{t('before_after.sub')}</p>
          </div>
        </Reveal>

        <Reveal>
          <div
            ref={containerRef}
            data-testid="before-after-slider"
            role={ready ? 'slider' : undefined}
            tabIndex={ready ? 0 : undefined}
            aria-label={ready ? t('before_after.slider_label') : undefined}
            aria-describedby={ready ? `${id}-hint ${id}-disclaimer` : undefined}
            aria-busy={!ready && !imageError}
            aria-valuenow={ready ? Math.round(pos) : undefined}
            aria-valuemin={ready ? 0 : undefined}
            aria-valuemax={ready ? 100 : undefined}
            aria-valuetext={ready ? t('before_after.slider_value', { before: Math.round(pos), after: 100 - Math.round(pos) }) : undefined}
            className="relative aspect-[4/3] md:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#151A23] bg-[#0F1115] cursor-ew-resize select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F2C94C]"
            style={{ touchAction: 'pan-y pinch-zoom' }}
            onPointerDown={event => {
              if (!ready || event.button !== 0) return;
              draggingRef.current = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              handleMove(event.clientX);
            }}
            onPointerMove={event => { if (ready && draggingRef.current) handleMove(event.clientX); }}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onLostPointerCapture={() => { draggingRef.current = false; }}
            onKeyDown={(e) => {
              if (!ready || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
              e.preventDefault();
              if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
              if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
              if (e.key === 'Home') setPos(0);
              if (e.key === 'End') setPos(100);
            }}
          >
            <img key={`after-${imageAttempt}`} {...AFTER_IMAGE} data-testid="before-after-after-image" alt={t('before_after.after_alt')} loading="lazy" decoding="async" draggable={false}
              onLoad={() => setLoaded(current => ({ ...current, after: true }))} onError={() => setImageError(true)} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute top-4 right-4 ty-chip ty-chip-red font-mono">{t('before_after.after')}</div>

            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <img key={`before-${imageAttempt}`} {...BEFORE_IMAGE} data-testid="before-after-before-image" alt={t('before_after.before_alt')} loading="lazy" decoding="async" draggable={false}
                onLoad={() => setLoaded(current => ({ ...current, before: true }))} onError={() => setImageError(true)} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute top-4 left-4 ty-chip font-mono">{t('before_after.before')}</div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050608]/40 via-transparent to-[#050608]/30" />

            <div data-testid="before-after-handle" className="ty-ba-handle" style={{ left: `${pos}%` }} />
            <TelemetryTicks />
            {!ready && <div className="absolute inset-0 bg-[#0F1115] flex flex-col items-center justify-center gap-4 p-6 text-center text-ty-textMid cursor-default">
              <p role={imageError ? 'alert' : 'status'}>{t(imageError ? 'before_after.error' : 'before_after.loading')}</p>
              {imageError && <button type="button" className="ty-btn-ghost" data-testid="before-after-retry-button" onClick={() => {
                setImageError(false); setLoaded({ before: false, after: false }); setImageAttempt(current => current + 1);
              }}>{t('before_after.retry')}</button>}
            </div>}
          </div>
          <p id={`${id}-disclaimer`} data-testid="before-after-disclaimer" className="mt-4 text-xs md:text-sm text-ty-textMid max-w-3xl leading-relaxed">
            {t('before_after.disclaimer')}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
