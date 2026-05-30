import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * useMagnetic returns a ref. Attach it to a DOM element and it will subtly
 * translate towards the cursor on hover (capped + damped), then snap back
 * smoothly on leave. Disabled on coarse pointers (touch) and prefers-reduced-motion.
 *
 * options:
 *   strength: max travel in px on each axis (default 14)
 *   ease: gsap ease string (default 'power3.out')
 */
export function useMagnetic({ strength = 14, ease = 'power3.out' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarse) return undefined;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const dx = Math.max(-strength, Math.min(strength, (x / rect.width) * strength * 2));
      const dy = Math.max(-strength, Math.min(strength, (y / rect.height) * strength * 2));
      gsap.to(el, { x: dx, y: dy, duration: 0.45, ease });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, ease]);

  return ref;
}
