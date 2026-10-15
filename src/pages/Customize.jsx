import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { SelectCard } from './customize/SelectCard';
import { ConfiguratorSelect } from './customize/ConfiguratorSelect';
import { VehicleStage } from './customize/VehicleStage';
import { useBrands, useVehicleSelection } from './customize/useCustomize';
import { VehicleDetails } from './customize/VehicleDetails';
import { ProjectBuilder } from './customize/ProjectBuilder';
import { catalogueCategory, vehicleViewSet } from './customize/vehicleViews';
import './customize/Customize.css';

const EMDASH = '\u2014';

export default function Customize() {
  const { t } = useTranslation();
  const brands = useBrands();
  const { brand, setBrand, model, setModel, generation, setGeneration, models, modelObj, details, setDetails } =
    useVehicleSelection();
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [projectBusy, setProjectBusy] = useState(false);
  useEffect(() => { setActiveHotspot(null); setActiveCategory('all'); }, [brand, model, generation]);
  const generationRecord = useMemo(
    () => modelObj?.generation_records?.find((item) => item.name === generation) || null,
    [generation, modelObj]
  );
  const selection = useMemo(() => ({ brand, model, generation, ...details }), [brand, model, generation, details]);
  const views = useMemo(() => generationRecord ? vehicleViewSet(selection) : null, [selection, generationRecord]);
  const complete = Boolean(brand && model && generationRecord);
  const brandName = brands.find(item => item.slug === brand)?.name || brand;
  const compatibleUrl = useMemo(() => {
    const params = new URLSearchParams({ brand, model, chassis: generation });
    if (details.year) params.set('year', details.year);
    if (details.body_type) params.set('body_type', details.body_type);
    return `/shop?${params.toString()}`;
  }, [brand, generation, model, details.year, details.body_type]);

  const handleHotspotClick = useCallback((id) => {
    setActiveHotspot(id);
    setActiveCategory(catalogueCategory(generationRecord?.hotspots?.find(item => item.id === id)?.category_slug));
  }, [generationRecord]);
  const handleCategoryChange = useCallback((category) => {
    setActiveHotspot(null);
    setActiveCategory(catalogueCategory(category));
  }, []);

  const brandPlaceholder = useMemo(() => `${EMDASH} ${t('customize.select_brand')} ${EMDASH}`, [t]);
  const modelPlaceholder = useMemo(() => `${EMDASH} ${t('customize.select_model')} ${EMDASH}`, [t]);
  const genPlaceholder = useMemo(() => `${EMDASH} ${t('customize.select_generation')} ${EMDASH}`, [t]);

  return (
    <main data-testid="page-customize" className="customize-page pt-28 pb-24">
      <div className="ty-container">
        <Reveal>
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> Configurator
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('customize.title')}</h1>
          <p className="mt-3 text-ty-textMid max-w-2xl">{t('customize.sub')}</p>
          <p className="customize-intro-note">{t('customize.project.visual_hint')}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3" data-testid="customize-selector">
          <SelectCard label={t('customize.select_brand')}>
            <ConfiguratorSelect
              value={brand}
              onValueChange={setBrand}
              placeholder={brandPlaceholder}
              options={brands.map((item) => ({ value: item.slug, label: item.name }))}
              testId="compatibility-brand-select"
              disabled={projectBusy}
            />
          </SelectCard>
          <SelectCard label={t('customize.select_model')}>
            <ConfiguratorSelect
              value={model}
              onValueChange={setModel}
              placeholder={modelPlaceholder}
              options={models.map((item) => ({ value: item.name, label: item.name }))}
              disabled={!brand || projectBusy}
              testId="compatibility-model-select"
            />
          </SelectCard>
          <SelectCard label={t('customize.select_generation')}>
            <ConfiguratorSelect
              value={generation}
              onValueChange={setGeneration}
              placeholder={genPlaceholder}
              options={(modelObj?.generations || []).map((item) => ({ value: item, label: item }))}
              disabled={!modelObj || projectBusy}
              testId="compatibility-generation-select"
            />
          </SelectCard>
        </div>

        <VehicleStage brand={brand} model={model} generation={generationRecord} onHotspotClick={handleHotspotClick} activeHotspot={activeHotspot} views={views} category={activeCategory} onCategoryChange={handleCategoryChange} disabled={projectBusy} />

        {complete && <>
          <VehicleDetails generation={generationRecord} details={details} onChange={setDetails} disabled={projectBusy} />
          <ProjectBuilder key={JSON.stringify(selection)} selection={selection} brandName={brandName} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} onBusyChange={setProjectBusy} />
        </>}

        {brand && model && generation && (
          <div className="mt-5 flex justify-end">
            <Link to={compatibleUrl} className="ty-btn-primary h-12 px-6 text-xs uppercase tracking-[0.14em]">
              {t('customize.project.browse_catalogue')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
