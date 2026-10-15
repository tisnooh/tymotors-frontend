import React, { useState } from 'react';
import { Car, Sparkles } from 'lucide-react';
import LoadedImage from '@/components/shared/LoadedImage';
import { useTranslation } from 'react-i18next';
import { VIEW_CATEGORIES } from './vehicleViews';

const BRAND_PRESENTATION = {
  bmw: { name: 'BMW', icon: 'https://cdn.simpleicons.org/bmw/FFFFFF' },
  'mercedes-benz': { name: 'Mercedes-Benz', icon: 'https://cdn.simpleicons.org/mercedes/FFFFFF' },
  audi: { name: 'Audi', icon: 'https://cdn.simpleicons.org/audi/FFFFFF' },
  porsche: { name: 'Porsche', icon: 'https://cdn.simpleicons.org/porsche/FFFFFF' },
  volkswagen: { name: 'Volkswagen', icon: 'https://cdn.simpleicons.org/volkswagen/FFFFFF' },
  toyota: { name: 'Toyota', icon: 'https://cdn.simpleicons.org/toyota/FFFFFF' },
};

function BrandWaitingState({ brand, model, selectionComplete }) {
  const presentation = BRAND_PRESENTATION[brand];
  const name = presentation?.name || 'TYMotors';
  const instruction = selectionComplete
    ? 'Visuel exact en cours de vérification'
    : model
      ? 'Choisissez une génération'
      : brand
        ? 'Choisissez votre modèle'
        : 'Choisissez votre marque';

  return (
    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      {presentation ? (
        <img
          src={presentation.icon}
          alt={`Logo ${name}`}
          className="h-20 w-32 object-contain md:h-28 md:w-44"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="ty-display text-3xl tracking-[0.24em] text-white md:text-5xl">
          TY<span className="text-[#C7CDD6]">MOTORS</span>
        </div>
      )}
      <p className="mt-6 ty-display text-xl uppercase tracking-[0.14em] text-white md:text-3xl">{name}</p>
      <div className="my-4 h-px w-16 bg-[#E10600]" />
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ty-textLow md:text-xs">{instruction}</p>
    </div>
  );
}

function Hotspot({ hotspot, onClick, isActive }) {
  return <button type="button" data-testid="customize-hotspot" onClick={() => onClick(hotspot.id)} className="ty-hotspot"
    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: isActive ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%)',
      boxShadow: isActive ? '0 0 0 4px rgba(225,6,0,0.4)' : 'none' }} aria-label={hotspot.label}>
    <span className="sr-only">{hotspot.label}</span>
  </button>;
}

export function VehicleStage({ brand, model, generation, onHotspotClick, activeHotspot, views, category = 'all', onCategoryChange, disabled }) {
  const { t } = useTranslation();
  const [loadedImage, setLoadedImage] = useState(null);
  const hotspots = views ? [] : generation?.hotspots || [];
  const active = hotspots.find((item) => item.id === activeHotspot);
  const dedicated = views?.[category === 'all' ? 'performance' : category];
  const image = dedicated?.src || active?.image_url || generation?.stage_image_url;
  const alt = dedicated ? t(dedicated.altKey) : active?.image_alt || generation?.stage_image_alt || `${model || 'Véhicule'} ${generation?.name || ''}`;
  const selectionComplete = Boolean(brand && model && generation);
  return <div className="customize-stage mt-10 relative w-full overflow-hidden rounded-2xl border border-[#151A23] bg-[#0A0B0E]" data-testid="customize-stage">
    {views && selectionComplete && <div className="customize-stage-heading"><span>{BRAND_PRESENTATION[brand]?.name || brand} · {model} · {generation.name}</span><span>{t(`customize.project.category_${category === 'all' ? 'performance' : category}`)}</span></div>}
    <div className={`customize-stage-frame relative aspect-[16/9] flex items-center justify-center md:aspect-[21/8] ${dedicated ? 'has-views' : ''}`}>
      {!image && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,6,0,0.13),transparent_38%),linear-gradient(135deg,#0A0B0E_0%,#10131A_50%,#08090C_100%)]" />}
      {!image && <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />}
      {image ? <LoadedImage src={image} alt={alt} className={`absolute inset-0 h-full w-full ${dedicated ? '' : 'opacity-75'}`} imageClassName={dedicated ? 'object-contain' : 'object-cover'} onStatus={status => setLoadedImage(status === 'loaded' ? image : null)}/> : <BrandWaitingState brand={brand} model={model} selectionComplete={selectionComplete} />}
      {!dedicated && <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent pointer-events-none" />}
      {selectionComplete && !views && <div className="absolute top-5 left-5 ty-chip ty-chip-red font-mono"><Sparkles className="h-3 w-3" />{brand.toUpperCase()} · {model} · {generation.name}</div>}
      {loadedImage === image && image && hotspots.map((hotspot) => <Hotspot key={hotspot.id} hotspot={hotspot} onClick={onHotspotClick} isActive={activeHotspot === hotspot.id} />)}
    </div>
    <div className="px-4 py-4 border-t border-[#151A23]">
      {!selectionComplete && <p className="text-sm text-ty-textMid flex items-center gap-2"><Car className="h-4 w-4" />Marque, modèle puis génération : aucune image générique ne sera substituée.</p>}
      {selectionComplete && onCategoryChange && <div className="customize-view-controls" role="group" aria-label={t('customize.project.vehicle_views')}>{VIEW_CATEGORIES.map(value => <button type="button" key={value} disabled={disabled} aria-pressed={category === value || category === 'all' && value === 'performance'} onClick={() => onCategoryChange(value)}>{t(`customize.project.category_${value}`)}</button>)}</div>}
      {views && <p className="customize-view-note">{t(views.noteKey)}</p>}
      {selectionComplete && !views && hotspots.length === 0 && <p className="text-sm text-ty-textMid">{t(category === 'interior' || category === 'technology' ? 'customize.project.view_pending' : 'customize.project.no_zones')}</p>}
      {hotspots.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">{hotspots.map((hotspot) => <button key={hotspot.id} onClick={() => onHotspotClick(hotspot.id)} className={`rounded-xl border px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] ${activeHotspot === hotspot.id ? 'border-[#E10600] bg-[#E10600]/10 text-white' : 'border-[#232B3A] text-ty-textMid'}`}>{hotspot.label}</button>)}</div>}
    </div>
  </div>;
}
