import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './HomeEditorial.css';

export function HomeEditorialPhoto(props) {
  return <PhotoFrame key={props.photo.src} {...props} />;
}

function PhotoFrame({ photo, className = '' }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  return <div className={`home-editorial-photo ${className}`}>
    {failed ? <p role="status" className="home-editorial-photo-error">{t('home_photos.unavailable')}<span>{t(photo.altKey)}</span></p>
      : <img src={photo.src} width={photo.width} height={photo.height} alt={t(photo.altKey)} loading="lazy" decoding="async" onError={() => setFailed(true)} />}
  </div>;
}
