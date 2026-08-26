import { useEffect, useMemo, useState } from 'react';
import { Brands as BrandsApi, Compatibility, Products } from '@/lib/api';
import { readVehicleSelection, saveVehicleSelection } from '@/lib/vehicleSelection';

export function useBrands() {
  const [brands, setBrands] = useState([]);
  useEffect(() => {
    let cancelled = false;
    BrandsApi.list()
      .then((data) => { if (!cancelled) setBrands(data); })
      .catch((e) => {
        console.warn('[TYMotors] brand list failed:', e?.message || e);
      });
    return () => { cancelled = true; };
  }, []);
  return brands;
}

export function useCompatibility(brandSlug) {
  const [models, setModels] = useState([]);
  useEffect(() => {
    if (!brandSlug) { setModels([]); return undefined; }
    let cancelled = false;
    Compatibility.list(brandSlug)
      .then((data) => { if (!cancelled) setModels(data); })
      .catch((e) => {
        console.warn('[TYMotors] compatibility load failed:', e?.message || e);
      });
    return () => { cancelled = true; };
  }, [brandSlug]);
  return models;
}

export function useRecommendedForHotspot(hotspot, selection) {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotspot || !selection.brand || !selection.model || !selection.generation) { setRecommended([]); return undefined; }

    let cancelled = false;
    setLoading(true);
    Products.list({
      category: hotspot.category_slug,
      brand: selection.brand,
      model: selection.model,
      chassis: selection.generation,
      limit: 50,
    }).then((response) => {
        if (cancelled) return;
        setRecommended((response.items || []).slice(0, 6));
      })
      .catch((e) => {
        console.warn('[TYMotors] recommended products failed:', e?.message || e);
        if (!cancelled) setRecommended([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [hotspot, selection.brand, selection.model, selection.generation]);

  return { recommended, loading };
}

export function useVehicleSelection() {
  const initial = useMemo(() => readVehicleSelection(), []);
  const [brand, setBrandState] = useState(initial.brand);
  const [model, setModelState] = useState(initial.model);
  const [generation, setGenerationState] = useState(initial.generation);
  const models = useCompatibility(brand);

  const setBrand = (value) => {
    setBrandState(value);
    setModelState('');
    setGenerationState('');
  };

  const setModel = (value) => {
    setModelState(value);
    setGenerationState('');
  };

  const setGeneration = (value) => {
    setGenerationState(value);
  };

  useEffect(() => {
    saveVehicleSelection({ brand, model, generation, year: '' });
  }, [brand, generation, model]);

  const modelObj = useMemo(() => models.find((m) => m.name === model), [models, model]);

  return { brand, setBrand, model, setModel, generation, setGeneration, models, modelObj };
}
