import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { HOTSPOTS } from './useCustomize';

const VEHICLE_IMG = 'https://images.unsplash.com/photo-1634673970798-a15ae56f6c65?auto=format&fit=crop&w=2400&q=90';

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
  return (
    <div className="mt-10 relative w-full overflow-hidden rounded-2xl border border-[#151A23] bg-[#0A0B0E]">
      <div className="relative aspect-[16/9]">
        <img src={VEHICLE_IMG} alt="Vehicle" className="absolute inset-0 h-full w-full object-cover opacity-70" />
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
              Select a vehicle to activate hotspots
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
