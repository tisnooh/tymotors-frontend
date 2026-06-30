import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { HOTSPOTS } from './useCustomize';

const MODEL_IMAGES = {
  // BMW
  'bmw::Série 3': 'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?auto=format&fit=crop&w=2400&q=80',
  'bmw::Série 4': 'https://images.unsplash.com/photo-1741889838631-e8a1850854dc?auto=format&fit=crop&w=2400&q=80',

  // Audi
  'audi::A3': 'https://images.unsplash.com/photo-1546088626-8f9b425f61ca?auto=format&fit=crop&w=2400&q=80',
  'audi::A4': 'https://images.unsplash.com/photo-1539119838978-ce22e2fd0212?auto=format&fit=crop&w=2400&q=80',
  'audi::A5': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2400&q=80',

  // Mercedes-Benz
  'mercedes-benz::Classe C': 'https://images.unsplash.com/photo-1765446607390-aa61ae857a50?auto=format&fit=crop&w=2400&q=80',
  'mercedes-benz::Classe A': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=2400&q=80',

  // Volkswagen
  'volkswagen::Golf 7': 'https://images.unsplash.com/photo-1748466245947-bb2e22e758ed?auto=format&fit=crop&w=2400&q=80',

  // Porsche
  'porsche::911':     'https://images.unsplash.com/photo-1614244788272-f6dcdfd8df9f?auto=format&fit=crop&w=2400&q=80',
  'porsche::Cayman':  'https://images.unsplash.com/photo-1699325413806-48286e94351c?auto=format&fit=crop&w=2400&q=80',
  'porsche::Boxster': 'https://images.unsplash.com/photo-1750097296925-cbe35257d0f1?auto=format&fit=crop&w=2400&q=80',
  'porsche::Cayenne': 'https://images.unsplash.com/photo-1762120516501-bc1229824b4d?auto=format&fit=crop&w=2400&q=80',

  // Toyota
  'toyota::GR Supra':   'https://images.unsplash.com/photo-1752560904748-390f9fa28bdb?auto=format&fit=crop&w=2400&q=80',
  'toyota::GR Yaris':   'https://images.unsplash.com/photo-1748939238043-403668614be9?auto=format&fit=crop&w=2400&q=80',
  'toyota::GR86 / GT86':'https://images.unsplash.com/photo-1541878117466-0e3000a65864?auto=format&fit=crop&w=2400&q=80',
};

const BRAND_FALLBACK = {
  'bmw': 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=2400&q=90',
  'mercedes-benz': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2400&q=90',
  'audi': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90',
  'porsche': 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=2400&q=90',
  'volkswagen': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=2400&q=90',
  'toyota': 'https://images.unsplash.com/photo-1611821064430-0d40291922d2?auto=format&fit=crop&w=2400&q=90',
  'default': 'https://images.unsplash.com/photo-1634673970798-a15ae56f6c65?auto=format&fit=crop&w=2400&q=90',
};

const HOTSPOT_IMAGES = {
  front: 'https://images.unsplash.com/photo-1605283176568-9b41fde3eba3?auto=format&fit=crop&w=2400&q=80',
  lighting: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=80',
  rear: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=2400&q=80',
  interior: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2400&q=80',
  technology: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=80',
};

function getImage(brand, model, activeHotspot) {
  if (activeHotspot && HOTSPOT_IMAGES[activeHotspot]) return HOTSPOT_IMAGES[activeHotspot];
  if (brand && model && MODEL_IMAGES[`${brand}::${model}`]) return MODEL_IMAGES[`${brand}::${model}`];
  return BRAND_FALLBACK[brand] || BRAND_FALLBACK['default'];
}

function Hotspot({ hotspot, onClick, disabled, isActive }) {
  return (
    <button
      type="button"
      data-testid="customize-hotspot"
      onClick={() => onClick(hotspot.id)}
      disabled={disabled}
      className="ty-hotspot"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        opacity: disabled ? 0.35 : 1,
        transform: isActive ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)',
        transition: 'transform 0.2s ease',
        boxShadow: isActive ? '0 0 0 4px rgba(225,6,0,0.4)' : 'none',
      }}
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

export function VehicleStage({ brand, model, onHotspotClick, activeHotspot }) {
  const { t } = useTranslation();
  const brandSelected = Boolean(brand);
  const targetImg = getImage(brand, model, activeHotspot);

  const [imgs, setImgs] = useState([{ src: targetImg, id: 0 }]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setImgs(prev => {
      const last = prev[prev.length - 1];
      if (last.src === targetImg) return prev;
      return [...prev, { src: targetImg, id: last.id + 1 }];
    });
  }, [targetImg]);

  useEffect(() => {
    if (imgs.length <= 1) return;
    const last = imgs[imgs.length - 1];
    const timer = setTimeout(() => {
      setActive(last.id);
      setImgs([last]);
    }, 50);
    return () => clearTimeout(timer);
  }, [imgs]);

  return (
    <div className="mt-10 relative w-full overflow-hidden rounded-2xl border border-[#151A23] bg-[#0A0B0E]">
      <div className="relative aspect-[16/9]">
        {imgs.map(({ src, id }) => (
          <img
            key={id}
            src={src}
            alt="Vehicle"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: id === active ? 0.75 : 0,
              transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/35 via-transparent to-[#050608]/35" />
        <CornerBrackets />

        {brandSelected && (
          <div className="absolute top-5 left-5 ty-chip ty-chip-red font-mono">
            <Sparkles className="h-3 w-3" />
            {brand.toUpperCase()}{model ? ` · ${model}` : ''}
            {activeHotspot && (
              <span className="ml-2 opacity-70">· {t(`customize.hotspots.${activeHotspot}`)}</span>
            )}
          </div>
        )}

        {HOTSPOTS.map((h) => (
          <Hotspot
            key={h.id}
            hotspot={h}
            onClick={onHotspotClick}
            disabled={!brandSelected}
            isActive={activeHotspot === h.id}
          />
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
          <button
            key={h.id}
            type="button"
            disabled={!brandSelected}
            onClick={() => onHotspotClick(h.id)}
            className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.22em] disabled:opacity-40 hover:text-white transition-colors"
            style={{ color: activeHotspot === h.id ? '#E10600' : undefined }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: activeHotspot === h.id ? '#E10600' : '#E10600', opacity: activeHotspot === h.id ? 1 : 0.5 }}
            />
            {t(`customize.hotspots.${h.id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
