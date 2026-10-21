import React, { useState } from 'react';
import PhotoBackdrop from './PhotoBackdrop';

// Key the frame by source: a new selection never inherits the old loading/error state.
export default function LoadedImage(props) { return <ImageFrame key={props.src || 'missing'} {...props}/>; }
function ImageFrame({ src, alt, className = '', imageClassName = 'object-cover', onStatus, loading = 'eager', retry = true, fillBackground = false }) {
  const [status, setStatus] = useState(src ? 'loading' : 'error'), [attempt, setAttempt] = useState(0);
  const [letterboxed, setLetterboxed] = useState(false);
  function update(next) { setStatus(next); onStatus?.(next); }
  return <div className={`relative ${className}`} aria-busy={status === 'loading'}>
    {fillBackground && letterboxed && status === 'loaded' && <PhotoBackdrop src={src} />}
    {src && status !== 'error' && <img key={attempt} src={src} alt={alt} loading={loading} decoding="async" onLoad={event => { setLetterboxed(event.currentTarget.naturalWidth !== event.currentTarget.naturalHeight); update('loaded'); }} onError={() => update('error')} className={`h-full w-full ${fillBackground ? 'relative' : ''} ${imageClassName} ${status === 'loading' ? 'opacity-0' : ''}`}/>}
    {status === 'loading' && <div role="status" className="absolute inset-0 flex items-center justify-center text-ty-textMid text-sm">Chargement de la photo…</div>}
    {status === 'error' && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-ty-textMid text-sm"><p>{src ? 'Cette photo ne peut pas être chargée.' : 'Photo non disponible.'}</p>{src && retry && <button type="button" className="underline relative z-10" onClick={() => { setAttempt(n => n + 1); update('loading'); }}>Réessayer</button>}</div>}
  </div>;
}
