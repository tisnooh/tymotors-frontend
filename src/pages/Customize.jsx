import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { SelectCard } from './customize/SelectCard';
import { ConfiguratorSelect } from './customize/ConfiguratorSelect';
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
  useEffect(() => setActiveHotspot(null), [brand, model, generation]);
  const generationRecord = useMemo(
    () => modelObj?.generation_records?.find((item) => item.name === generation) || null,
    [generation, modelObj]
  );
  const activeHotspotRecord = useMemo(
    () => generationRecord?.hotspots?.find((item) => item.id === activeHotspot) || null,
    [activeHotspot, generationRecord]
  );
  const selection = useMemo(() => ({ brand, model, generation }), [brand, model, generation]);
  const { recommended, loading: loadingProducts } = useRecommendedForHotspot(activeHotspotRecord, selection);
  const compatibleUrl = useMemo(() => {
    const params = new URLSearchParams({ brand, model, chassis: generation });
    return `/shop?${params.toString()}`;
  }, [brand, generation, model]);

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

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3" data-testid="customize-selector">
          <SelectCard label={t('customize.select_brand')}>
            <ConfiguratorSelect
              value={brand}
              onValueChange={setBrand}
              placeholder={brandPlaceholder}
              options={brands.map((item) => ({ value: item.slug, label: item.name }))}
              testId="compatibility-brand-select"
            />
          </SelectCard>
          <SelectCard label={t('customize.select_model')}>
            <ConfiguratorSelect
              value={model}
              onValueChange={setModel}
              placeholder={modelPlaceholder}
              options={models.map((item) => ({ value: item.name, label: item.name }))}
              disabled={!brand}
              testId="compatibility-model-select"
            />
          </SelectCard>
          <SelectCard label={t('customize.select_generation')}>
            <ConfiguratorSelect
              value={generation}
              onValueChange={setGeneration}
              placeholder={genPlaceholder}
              options={(modelObj?.generations || []).map((item) => ({ value: item, label: item }))}
              disabled={!modelObj}
              testId="compatibility-generation-select"
            />
          </SelectCard>
        </div>

        <VehicleStage brand={brand} model={model} generation={generationRecord} onHotspotClick={handleHotspotClick} activeHotspot={activeHotspot} />

        {brand && model && generation && (
          <div className="mt-5 flex justify-end">
            <Link to={compatibleUrl} className="ty-btn-primary h-12 px-6 text-xs uppercase tracking-[0.14em]">
              Voir tous les produits compatibles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

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
