import { useEffect, useState } from 'react';

// The visual viewport can shrink when the phone keyboard covers the layout
// viewport. Keep the input/close button above it without touching GSAP/scroll.
export function useSearchViewport(open) {
  const [viewport, setViewport] = useState(null);
  useEffect(() => {
    const visual = window.visualViewport;
    if (!open || !visual) { setViewport(null); return undefined; }
    const update = () => {
      if (visual.height > 0) setViewport({ height: Math.round(visual.height), top: Math.round(visual.offsetTop || 0),
        width: Math.round(visual.width || window.innerWidth), left: Math.round(visual.offsetLeft || 0) });
    };
    update();
    visual.addEventListener('resize', update, { passive: true });
    visual.addEventListener('scroll', update, { passive: true });
    return () => { visual.removeEventListener('resize', update); visual.removeEventListener('scroll', update); };
  }, [open]);
  return viewport;
}
