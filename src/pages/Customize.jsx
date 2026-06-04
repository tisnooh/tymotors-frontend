import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/shared/Reveal';
import { SelectCard } from './customize/SelectCard';
import { VehicleStage } from './customize/VehicleStage';
import { RecommendedDrawer } from './customize/RecommendedDrawer';
import { useBrands, useVehicleSelection, useRecommendedForHotspot } from './customize/useCustomize';

// Stable IDs for skeleton placeholders (lint: no-array-index-key)
const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];
const EMDASH = '\u2014';

export default function Customize() {
  const { t } = useTranslation();
  const brands = useBrands();
  const { brand, setBrand, model, setModel, generation, setGeneration, models, modelObj } =
    useVehicleSelection();
  const [activeHotspot, setActiveHotspot] = useState(null);
  const { recommended, loading: loadingProducts } = useRecommendedForHotspot(activeHotspot, brand);

  const handleHotspotClick = useCallback((id) => setActiveHotspot(id), []);
  const handleClose = useCallback(() => setActiveHotspot(null), []);

  const brandPlaceholder = useMemo(() => `${EMDASH} ${t('customize.select_brand')} ${EMDASH}`, [t]);
  const modelPlaceholder = useMemo(() => `${EMDASH} ${t('customize.select_model')} ${EMDASH}`, [t]);
  const genPlaceholder = useMemo(() => `${EMDASH} ${t('customize.select_generation')} ${EMDASH}`, [t]);

  return (
    <main data-testid="page-customize" className="pt-28 pb-24">
      <div className="ty-container">
        <Reveal>
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> Configurator
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('customize.title')}</h1>
          <p className="mt-3 text-ty-textMid max-w-2xl">{t('customize.sub')}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="customize-selector">
          <SelectCard label={t('customize.select_brand')}>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              data-testid="compatibility-brand-select"
              className="w-full h-12 bg-transparent text-white font-mono text-sm focus:outline-none"
            >
              <option value="">{brandPlaceholder}</option>
              {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </SelectCard>
          <SelectCard label={t('customize.select_model')}>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!brand}
              data-testid="compatibility-model-select"
              className="w-full h-12 bg-transparent text-white font-mono text-sm focus:outline-none disabled:opacity-50"
            >
              <option value="">{modelPlaceholder}</option>
              {models.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </SelectCard>
          <SelectCard label={t('customize.select_generation')}>
            <select
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              disabled={!modelObj}
              data-testid="compatibility-generation-select"
              className="w-full h-12 bg-transparent text-white font-mono text-sm focus:outline-none disabled:opacity-50"
            >
              <option value="">{genPlaceholder}</option>
              {modelObj?.generations?.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </SelectCard>
        </div>

        <VehicleStage brand={brand} model={model} onHotspotClick={handleHotspotClick} activeHotspot={activeHotspot} />

        <RecommendedDrawer
          activeHotspot={activeHotspot}
          loading={loadingProducts}
          recommended={recommended}
          skeletonKeys={SKELETON_KEYS}
          onClose={handleClose}
        />
      </div>
    </main>
  );
}
