import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Wrap children to trigger fade/translate reveal on scroll.
export function Reveal({ children, delay = 0, y = 24, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = ref.current;
    if (!el) return;
    if (reduced) { setAnimatedIn(true); return; }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y, filter: 'blur(6px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          delay,
          ease: 'power3.out',
          onStart: () => setAnimatedIn(true),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    }, el);

    // Fallback: ensure visible after 2s even if GSAP failed
    const timer = setTimeout(() => setAnimatedIn(true), 2000);
    return () => { clearTimeout(timer); ctx.revert(); };
  }, [delay, y]);

  return (
    <Tag ref={ref} className={className} style={animatedIn ? undefined : { visibility: 'hidden' }}>
      {children}
    </Tag>
  );
}
