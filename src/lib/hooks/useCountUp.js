import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp animates a numeric value from 0 to `to` over `duration` (ms)
 * when the target ref enters the viewport. Returns the current animated value
 * and a ref to attach to a triggering element.
 *
 * Honors prefers-reduced-motion.
 */
export function useCountUp({ to, duration = 1400, format = (v) => v, decimals = 0, startWhenVisible = true } = {}) {
  const [value, setValue] = useState(0);
  const triggerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setValue(to); return undefined; }

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      let frame = 0;
      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeOutCubic(progress);
        const current = to * eased;
        setValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    };

    if (!startWhenVisible) {
      return run();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration, decimals, startWhenVisible]);

  return { value, formatted: format(value), triggerRef };
}
