import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarsePointer) return undefined;

    let disposed = false;
    let lenis;
    let gsap;
    let onScroll;
    let tickerHandler;

    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(([lenisModule, gsapModule, triggerModule]) => {
      if (disposed) return;
      const Lenis = lenisModule.default;
      gsap = gsapModule.default;
      const { ScrollTrigger } = triggerModule;
      gsap.registerPlugin(ScrollTrigger);
      scrollTriggerRef.current = ScrollTrigger;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        smoothTouch: false,
      });
      lenisRef.current = lenis;
      onScroll = () => ScrollTrigger.update();
      lenis.on('scroll', onScroll);
      tickerHandler = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerHandler);
      gsap.ticker.lagSmoothing(0);
    }).catch(() => { /* Native scrolling remains available if enhancement loading fails. */ });

    return () => {
      disposed = true;
      if (gsap && tickerHandler) gsap.ticker.remove(tickerHandler);
      if (lenis && onScroll) lenis.off('scroll', onScroll);
      lenis?.destroy();
      lenisRef.current = null;
      scrollTriggerRef.current = null;
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    scrollTriggerRef.current?.refresh();
  }, [location.pathname]);

  return <>{children}</>;
}
