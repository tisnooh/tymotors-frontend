import React from 'react';
import { Car, ImageOff, Sparkles } from 'lucide-react';

function Hotspot({ hotspot, onClick, isActive }) {
  return <button type="button" data-testid="customize-hotspot" onClick={() => onClick(hotspot.id)} className="ty-hotspot"
    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: isActive ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%)',
      boxShadow: isActive ? '0 0 0 4px rgba(225,6,0,0.4)' : 'none' }} aria-label={hotspot.label}>
    <span className="sr-only">{hotspot.label}</span>
  </button>;
}

export function VehicleStage({ brand, model, generation, onHotspotClick, activeHotspot }) {
  const hotspots = generation?.hotspots || [];
  const active = hotspots.find((item) => item.id === activeHotspot);
  const image = active?.image_url || generation?.stage_image_url;
  const alt = active?.image_alt || generation?.stage_image_alt || `${model || 'Véhicule'} ${generation?.name || ''}`;
  const selectionComplete = Boolean(brand && model && generation);
  return <div className="mt-10 relative w-full overflow-hidden rounded-2xl border border-[#151A23] bg-[#0A0B0E]">
    <div className="relative aspect-[16/9] flex items-center justify-center">
      {image ? <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover opacity-75" /> : <div className="text-center text-ty-textLow"><ImageOff className="h-12 w-12 mx-auto" /><p className="font-mono text-xs uppercase tracking-[0.2em] mt-4">{selectionComplete ? 'Image exacte en cours de vérification' : 'Sélectionne une génération'}</p></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
      {selectionComplete && <div className="absolute top-5 left-5 ty-chip ty-chip-red font-mono"><Sparkles className="h-3 w-3" />{brand.toUpperCase()} · {model} · {generation.name}</div>}
      {hotspots.map((hotspot) => <Hotspot key={hotspot.id} hotspot={hotspot} onClick={onHotspotClick} isActive={activeHotspot === hotspot.id} />)}
      {image && generation?.image_attribution && <a href={generation.image_source_url || undefined} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white/70 hover:text-white">{generation.image_attribution}</a>}
    </div>
    <div className="px-4 py-4 border-t border-[#151A23]">
      {!selectionComplete && <p className="text-sm text-ty-textMid flex items-center gap-2"><Car className="h-4 w-4" />Marque, modèle puis génération : aucune image générique ne sera substituée.</p>}
      {selectionComplete && hotspots.length === 0 && <p className="text-sm text-amber-100">Les zones interactives de cette génération ne sont pas encore vérifiées. Aucun autre véhicule ne sera affiché à sa place.</p>}
      {hotspots.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">{hotspots.map((hotspot) => <button key={hotspot.id} onClick={() => onHotspotClick(hotspot.id)} className={`rounded-xl border px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] ${activeHotspot === hotspot.id ? 'border-[#E10600] bg-[#E10600]/10 text-white' : 'border-[#232B3A] text-ty-textMid'}`}>{hotspot.label}</button>)}</div>}
    </div>
  </div>;
}
