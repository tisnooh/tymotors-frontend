import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { HOTSPOTS } from './useCustomize';

const BRAND_IMAGES = {
  'bmw': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=2400&q=90',
  'mercedes-benz': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2400&q=90',
  'audi': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90',
  'porsche': 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=2400&q=90',
  'volkswagen': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=2400&q=90',
  'toyota': 'https://images.unsplash.com/photo-1611821064430-0d40291922d2?auto=format&fit=crop&w=2400&q=90',
  'default': 'https://images.unsplash.com/photo-1634673970798-a15ae56f6c65?auto=format&fit=crop&w=2400&q=90',
};

function Hotspot({ hotspot, onClick, disabled }) {
  return (
    <button
      type="button"
      data-testid="customize-hotspot"
      onClick={() => onClick(hotspot.id)}
      disabled={disabled}
      className="ty-hotspot"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, opacity: disabled ? 0.35 : 1 }}
      aria-label={hotspot.label}
    >
      <span className="sr-only">{hotspot.label}</span>
    </button>
  );
}

function CornerBrackets() {
  return (
    <>
      <div className="absolute top-4 left-4 h-3 w-3 border-t border-l border-[#F2C94C]" />
      <div className="absolute top-4 right-4 h-3 w-3 border-t border-r border-[#F2C94C]" />
      <div className="absolute bottom-4 left-4 h-3 w-3 border-b border-l border-[#F2C94C]" />
      <div className="absolute bottom-4 right-4 h-3 w-3 border-b border-r border-[#F2C94C]" />
    </>
  );
}

export function VehicleStage({ brand, model, onHotspotClick }) {
  const { t } = useTranslation();
  const brandSelected = Boolean(brand);

  const currentImg = BRAND_IMAGES[brand] || BRAND_IMAGES['default'];
  const [displayedImg, setDisplayedImg] = useState(currentImg);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (currentImg === displayedImg) return;
    setFading(true);
    const timer = setTimeout(() => {
      setDisplayedImg(currentImg);
      setFading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentImg]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-10 relative w-full overflow-hidden rounded-2xl border border-[#151A23] bg-[#0A0B0E]">
      <div className="relative aspect-[16/9]">
        <img
          src={displayedImg}
          alt="Vehicle"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: fading ? 0 : 0.7,
            transition: 'opacity 0.3s ease',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/35 via-transparent to-[#050608]/35" />
        <CornerBrackets />

        {brandSelected && (
          <div className="absolute top-5 left-5 ty-chip ty-chip-red font-mono">
            <Sparkles className="h-3 w-3" /> {brand.toUpperCase()} {model ? `\u00b7 ${model}` : ''}
          </div>
        )}

        {HOTSPOTS.map((h) => (
          <Hotspot key={h.id} hotspot={h} onClick={onHotspotClick} disabled={!brandSelected} />
        ))}

        {!brandSelected && (
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 flex items-end">
            <p className="font-mono text-xs text-ty-textMid uppercase tracking-[0.22em]">
              {t('customize.select_brand')} →
            </p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-[#151A23] flex flex-wrap gap-3 text-xs text-ty-textMid">
        {HOTSPOTS.map((h) => (
          <span key={h.id} className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.22em]">
            <span className="h-2 w-2 rounded-full bg-[#E10600]" />
            {t(`customize.hotspots.${h.id}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
