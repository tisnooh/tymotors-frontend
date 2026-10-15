import React from 'react';
import { useTranslation } from 'react-i18next';
import { HomePhotoCredits } from '@/components/home/HomeEditorialPhoto';
import { HOME_PHOTOS } from '@/lib/homeEditorialPhotos';

export default function PhotoCredits() {
  const { t } = useTranslation();
  return <main className="pt-32 pb-24 min-h-screen bg-[#070809]">
    <div className="ty-container max-w-4xl">
      <h1 className="ty-display text-white text-3xl md:text-5xl mb-6 break-words">{t('home_photos.credits')}</h1>
      <p className="text-sm leading-relaxed text-ty-textMid mb-8">{t('home_photos.disclaimer')}</p>
      <HomePhotoCredits photos={Object.values(HOME_PHOTOS)} />
    </div>
  </main>;
}
