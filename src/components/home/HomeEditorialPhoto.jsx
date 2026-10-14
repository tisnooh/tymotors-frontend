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

export function HomePhotoCredits({ photos }) {
  const { t } = useTranslation();
  const unique = [...new Map(photos.map(photo => [photo.id, photo])).values()];
  return <details className="home-photo-credits">
    <summary>{t('home_photos.credits')}</summary>
    <ul>{unique.map(photo => <li key={photo.id}>
      <span>{photo.author} — </span>
      <a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.title}</a>
      {' · '}<a href={photo.licenceUrl} target="_blank" rel="noopener noreferrer">{photo.licence}</a>
    </li>)}</ul>
    <p>{t('home_photos.presentation')}</p>
  </details>;
}
