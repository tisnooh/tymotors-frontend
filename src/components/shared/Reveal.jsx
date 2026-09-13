import React, { useEffect, useRef, useState } from 'react';

// Wrap children to trigger fade/translate reveal on scroll.
export function Reveal({ children, delay = 0, y = 24, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setAnimatedIn(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setAnimatedIn(true);
      observer.disconnect();
    }, { rootMargin: '0px 0px -12% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: animatedIn ? 1 : 0,
        transform: animatedIn ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        filter: animatedIn ? 'blur(0)' : 'blur(6px)',
        transition: 'opacity 0.7s ease, transform 0.9s cubic-bezier(0.2,0.6,0.2,1), filter 0.7s ease',
        transitionDelay: animatedIn ? `${delay}s` : '0s',
      }}
    >
      {children}
    </Tag>
  );
}
