import { useEffect, useState } from 'react';

export const PRODUCT_AUTOPLAY_DELAY = 4500;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function railVisible(rail) {
  if (!rail) return false;
  const rect = rail.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
}

// Keep one timer per mounted rail. Never rotate while a customer is interacting
// with a product, the rail is off screen, or the browser tab is hidden.
export function useProductAutoplay(railRef, enabled, advance) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(MOTION_QUERY).matches);
  const [playing, setPlaying] = useState(() => !window.matchMedia(MOTION_QUERY).matches);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [restart, setRestart] = useState(0);

  useEffect(() => {
    const media = window.matchMedia(MOTION_QUERY);
    const onMotionChange = () => {
      setReducedMotion(media.matches);
      // Do not restart unexpectedly when the accessibility preference changes.
      if (media.matches) setPlaying(false);
    };
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    media.addEventListener?.('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      media.removeEventListener?.('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !railRef.current) return undefined;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    setInView(false);
    const observer = new IntersectionObserver(() => setInView(railVisible(railRef.current)), { threshold: 0 });
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, [enabled, railRef]);

  const running = enabled && playing && !reducedMotion && inView && pageVisible && !hovered && !focused && !pointerActive;
  const state = !enabled ? 'inactive' : !playing ? 'paused' : reducedMotion ? 'reduced-motion' : !inView ? 'offscreen' : !pageVisible ? 'hidden' : hovered ? 'hover' : focused ? 'focus' : pointerActive ? 'touch' : 'running';
  const timerAllowed = enabled && playing && !reducedMotion && pageVisible && !hovered && !focused && !pointerActive;
  useEffect(() => {
    if (!timerAllowed) return undefined;
    const timer = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;
      // A pinned/repositioned page can leave IntersectionObserver temporarily
      // stale. Check the actual visible bounds before moving, not that signal
      // alone. One read every 4.5 s; never a per-frame React update.
      const visible = railVisible(rail);
      setInView(current => current === visible ? current : visible);
      if (!visible) return;
      const maximum = rail.scrollWidth - rail.clientWidth;
      if (maximum <= 2) return;
      advance(rail.scrollLeft >= maximum - 2 ? 'start' : 1);
    }, PRODUCT_AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [timerAllowed, advance, railRef, restart]);

  const restartDelay = () => setRestart(current => current + 1);
  const releasePointer = () => { setPointerActive(false); restartDelay(); };
  const haltAnimation = () => {
    const rail = railRef.current;
    rail?.scrollTo?.({ left: rail.scrollLeft, behavior: 'auto' });
  };
  return {
    playing, reducedMotion, running, state,
    toggle: () => {
      if (reducedMotion) return;
      if (playing) haltAnimation();
      setPlaying(current => !current);
      // An explicit Play action may resume while this control keeps focus.
      setFocused(false);
      restartDelay();
    },
    restartDelay,
    surfaceProps: {
      onPointerEnter: event => { if (event.pointerType === 'mouse') { haltAnimation(); setHovered(true); } },
      onPointerLeave: event => { if (event.pointerType === 'mouse') setHovered(false); releasePointer(); },
      onPointerDown: () => { haltAnimation(); setPointerActive(true); },
      onPointerUp: releasePointer,
      onPointerCancel: releasePointer,
      onFocusCapture: () => { haltAnimation(); setFocused(true); },
      onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); },
    },
  };
}
