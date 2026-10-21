import React from 'react';

// Decorative edge fill only: the real foreground photo remains uncropped.
// Render after its foreground has loaded so this never defeats lazy loading.
export default function PhotoBackdrop({ src, className = '' }) {
  if (!src) return null;
  return (
    <div aria-hidden="true" data-testid="photo-backdrop" className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${className}`}>
      <div className="absolute -inset-8 bg-cover bg-center blur-xl opacity-60" style={{ backgroundImage: `url(${JSON.stringify(src)})` }} />
    </div>
  );
}
