import { useEffect, useMemo, useState } from 'react';
import { Brands as BrandsApi, Compatibility, Products } from '@/lib/api';

export const HOTSPOTS = [
  { id: 'front', label: 'Avant', x: 22, y: 60, categories: ['performance'], subcats: ['Calandres', 'Extérieur'] },
  { id: 'lighting', label: 'Éclairage', x: 34, y: 50, categories: ['performance'], subcats: ['Calandres', 'Extérieur'] },
  { id: 'rear', label: 'Arrière', x: 82, y: 65, categories: ['performance'], subcats: ['Spoilers', 'Diffuseurs', "Sorties d'échappement", 'Silencieux'] },
  { id: 'interior', label: 'Intérieur', x: 56, y: 35, categories: ['interior'], subcats: ['Volants', 'Tableaux de bord', 'Intérieur carbone', 'Éclairage ambiant'] },
  { id: 'technology', label: 'Technologie', x: 50, y: 58, categories: ['technology'], subcats: ['Écrans CarPlay', 'Dashcams', 'Caméras de recul'] },
];

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

export function useRecommendedForHotspot(hotspotId, brandSlug) {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotspotId || !brandSlug) { setRecommended([]); return undefined; }
    const hotspot = HOTSPOTS.find((h) => h.id === hotspotId);
    if (!hotspot) { setRecommended([]); return undefined; }

    let cancelled = false;
    setLoading(true);
    Promise.all(hotspot.categories.map((c) => Products.list({ category: c, brand: brandSlug, limit: 50 })))
      .then((responses) => {
        if (cancelled) return;
        const all = responses.flatMap((d) => d.items || []);
        const filtered = all.filter((p) => !hotspot.subcats || hotspot.subcats.includes(p.subcategory));
        setRecommended(filtered.slice(0, 6));
      })
      .catch((e) => {
        console.warn('[TYMotors] recommended products failed:', e?.message || e);
        if (!cancelled) setRecommended([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [hotspotId, brandSlug]);

  return { recommended, loading };
}

export function useVehicleSelection() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [generation, setGeneration] = useState('');
  const models = useCompatibility(brand);

  useEffect(() => {
    setModel('');
    setGeneration('');
  }, [brand]);

  useEffect(() => {
    setGeneration('');
  }, [model]);

  const modelObj = useMemo(() => models.find((m) => m.name === model), [models, model]);

  return { brand, setBrand, model, setModel, generation, setGeneration, models, modelObj };
}
