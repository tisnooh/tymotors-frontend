import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Products, Brands as BrandsApi, Categories as CategoriesApi } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import { SlidersHorizontal } from 'lucide-react';
import { clearVehicleSelection, readVehicleSelection, saveVehicleSelection } from '@/lib/vehicleSelection';
import { normalizeSearchQuery } from '@/lib/search';

const SKELETON_KEYS = ['sh-1', 'sh-2', 'sh-3', 'sh-4', 'sh-5', 'sh-6', 'sh-7', 'sh-8', 'sh-9'];

function FilterGroup({ title, children }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-3">{title}</h4>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FilterItem({ active, onClick, children }) {
  const lineCls = active
    ? 'w-8 bg-[#E10600]'
    : 'w-3 bg-[#232B3A] group-hover:w-6 group-hover:bg-[#2E394D]';
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`group relative w-full text-left py-2 text-sm flex items-center gap-2 ${active ? 'text-white' : 'text-ty-textMid hover:text-white'}`}
      >
        <span className={`inline-block h-[1.5px] transition-all duration-300 ${lineCls}`} />
        {children}
      </button>
    </li>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {SKELETON_KEYS.map((k) => (
        <div key={k} className="aspect-[4/5] rounded-2xl bg-[#0F1115] border border-[#151A23] animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onReset }) {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center">
      <p className="text-ty-textMid">{t('shop.empty')}</p>
      <button type="button" onClick={onReset} className="mt-4 ty-btn-ghost h-10 text-xs uppercase tracking-[0.18em]">
        {t('shop.reset')}
      </button>
    </div>
  );
}

function ProductGridSection({ loading, products, error, onRetry, onReset }) {
  const { t } = useTranslation();
  if (loading) return <ProductSkeletonGrid />;
  if (error) return <div role="alert" className="rounded-2xl border border-[#232B3A] p-6 text-ty-textMid">
    <p>{t('search.catalogue_error')}</p><button type="button" data-testid="shop-retry-button" className="ty-btn-secondary mt-4" onClick={onRetry}>{t('search.retry')}</button>
  </div>;
  if (products.length === 0) return <EmptyState onReset={onReset} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {products.map((p, idx) => (
        <Reveal key={p.id} delay={(idx % 6) * 0.04}><ProductCard product={p} index={idx} /></Reveal>
      ))}
    </div>
  );
}

export default function Shop() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [mobileFilters, setMobileFilters] = useState(false);
  const resultsRef = useRef(null);

  const brand = params.get('brand') || '';
  const category = params.get('category') || '';
  const model = params.get('model') || '';
  const chassis = params.get('chassis') || '';
  const year = params.get('year') || '';
  const bodyType = params.get('body_type') || '';
  const sort = params.get('sort') || 'relevance';
  const query = normalizeSearchQuery(params.get('q') || '');
  const requestedPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pages = Math.max(1, Math.ceil(total / 100));

  useEffect(() => {
    if (query || brand || model || chassis || year || bodyType) return;
    const saved = readVehicleSelection();
    if (!saved.brand) return;
    const next = new URLSearchParams(params);
    next.set('brand', saved.brand);
    if (saved.model) next.set('model', saved.model);
    if (saved.generation) next.set('chassis', saved.generation);
    if (saved.year) next.set('year', saved.year);
    if (saved.body_type) next.set('body_type', saved.body_type);
    setParams(next, { replace: true });
    // This hydration intentionally runs once when the catalogue opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (brand) saveVehicleSelection({ brand, model, generation: chassis, year, body_type: bodyType });
  }, [bodyType, brand, chassis, model, year]);

  useEffect(() => {
    Promise.all([BrandsApi.list(), CategoriesApi.list()])
      .then(([b, c]) => { setBrands(b); setCats(c); })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('[TYMotors] facets load failed:', e?.message || e);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const args = { limit: 100, page };
    if (query) args.q = query;
    if (brand) args.brand = brand;
    if (category) args.category = category;
    if (model) args.model = model;
    if (chassis) args.chassis = chassis;
    if (year) args.year = year;
    if (bodyType) args.body_type = bodyType;
    if (sort) args.sort = sort;
    let cancelled = false;
    Products.list(args)
      .then((d) => {
        if (cancelled) return;
        if (!Array.isArray(d?.items)) throw new Error('Invalid catalogue response');
        setProducts(d.items);
        setTotal(Number.isInteger(d.total) && d.total >= d.items.length ? d.total : d.items.length);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]); setTotal(0); setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [brand, bodyType, category, chassis, model, page, query, retry, sort, year]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key); else next.set(key, value);
    if (key !== 'page') next.delete('page');
    if (key === 'brand') {
      ['model', 'chassis', 'year', 'body_type'].forEach((field) => next.delete(field));
    }
    setParams(next);
  };

  const removeVehicle = () => {
    clearVehicleSelection();
    const next = new URLSearchParams(params);
    ['brand', 'model', 'chassis', 'year', 'body_type'].forEach((field) => next.delete(field));
    setParams(next);
  };

  const changePage = value => {
    setFilter('page', String(value));
    resultsRef.current?.scrollIntoView?.({ block: 'start' });
  };

  const reset = () => {
    clearVehicleSelection();
    setParams(new URLSearchParams());
  };

  // Memoize body to keep parent JSX flat
  const body = useMemo(
    () => <ProductGridSection loading={loading} products={products} error={error} onRetry={() => setRetry(value => value + 1)} onReset={reset} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, products, error]
  );

  return (
    <main data-testid="page-shop" className="pt-28 pb-24">
      <div className="ty-container">
        <Reveal className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> Catalogue
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('shop.title')}</h1>
          <p className="mt-3 text-ty-textMid max-w-xl">{t('shop.sub')}</p>
        </Reveal>

        {(brand || model || chassis || year) && (
          <div className="mb-5 rounded-xl border border-[#F2C94C]/25 bg-[#F2C94C]/5 p-3 text-sm text-ty-textMid">
            <span className="font-mono text-[#F2C94C]">VOTRE VÉHICULE :</span>{' '}
            {[brand, model, chassis, year].filter(Boolean).join(' · ')}
            <span className="ml-2 text-xs text-ty-textLow">Les résultats ne valent confirmation que si la fiche indique « Compatible ».</span>
            <button type="button" onClick={removeVehicle} className="ml-3 text-xs font-mono uppercase tracking-wider text-white underline underline-offset-4">Retirer ce véhicule</button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p data-testid="shop-results-count" className="font-mono text-xs tracking-wider text-ty-textLow" role="status">
            {loading ? t('common.loading') : `${total} ${t('shop.results')}`}
          </p>
          <div className="flex items-center gap-2">
            <select aria-label="Trier les produits" value={sort} onChange={(event) => setFilter('sort', event.target.value)} className="h-10 rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-xs text-white">
              <option value="relevance">Pertinence</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="newest">Nouveautés</option>
            </select>
            <button
              type="button"
              onClick={() => setMobileFilters((v) => !v)}
              className="lg:hidden ty-btn-ghost h-10 text-xs tracking-[0.18em] uppercase"
            >
              <SlidersHorizontal className="h-4 w-4" /> {t('shop.filters')}
            </button>
          </div>
        </div>

        {query && <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#232B3A] bg-[#0F1115] p-4" data-testid="shop-search-query">
          <p className="min-w-0 break-words text-sm text-white">{t('search.query_label', { query })}</p>
          <button type="button" onClick={() => setFilter('q', '')} className="min-h-11 text-sm text-[#F2C94C] underline" data-testid="shop-clear-query-button">{t('search.clear')}</button>
        </div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside data-testid="shop-filters" className={`lg:col-span-3 ${mobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-8">
              <FilterGroup title={t('shop.category')}>
                <FilterItem active={!category} onClick={() => setFilter('category', '')}>{t('shop.all')}</FilterItem>
                {cats.map((c) => (
                  <FilterItem key={c.slug} active={category === c.slug} onClick={() => setFilter('category', c.slug)}>{c.name}</FilterItem>
                ))}
              </FilterGroup>

              <FilterGroup title={t('shop.brand')}>
                <FilterItem active={!brand} onClick={() => setFilter('brand', '')}>{t('shop.all')}</FilterItem>
                {brands.map((b) => (
                  <FilterItem key={b.slug} active={brand === b.slug} onClick={() => setFilter('brand', b.slug)}>{b.name}</FilterItem>
                ))}
              </FilterGroup>

              <div>
                <h4 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-3">Véhicule précis</h4>
                <div className="space-y-2">
                  <input aria-label="Modèle" placeholder="Modèle" value={model} onChange={(event) => setFilter('model', event.target.value)} className="h-10 w-full rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white" />
                  <input aria-label="Génération ou châssis" placeholder="Génération / châssis" value={chassis} onChange={(event) => setFilter('chassis', event.target.value)} className="h-10 w-full rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white" />
                  <input aria-label="Année" type="number" min="1980" max="2035" placeholder="Année" value={year} onChange={(event) => setFilter('year', event.target.value)} className="h-10 w-full rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white" />
                  <select aria-label="Carrosserie" value={bodyType} onChange={(event) => setFilter('body_type', event.target.value)} className="h-10 w-full rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white">
                    <option value="">Toutes carrosseries</option>
                    <option value="berline">Berline</option>
                    <option value="break">Break</option>
                    <option value="coupe">Coupé</option>
                    <option value="hatchback">Compacte</option>
                  </select>
                </div>
              </div>

              <button type="button" onClick={reset} data-testid="shop-reset-button" className="ty-btn-line h-10 w-full text-xs tracking-[0.18em] uppercase">
                {t('shop.reset')}
              </button>
            </div>
          </aside>

          <div ref={resultsRef} className="lg:col-span-9 scroll-mt-24">{body}
            {!loading && !error && pages > 1 && <nav aria-label={t('search.pagination')} className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button type="button" className="ty-btn-secondary disabled:opacity-40" disabled={page <= 1} onClick={() => changePage(page - 1)} data-testid="shop-previous-page">{t('search.previous_page')}</button>
              <span className="text-sm text-ty-textMid">{t('search.page', { page, pages })}</span>
              <button type="button" className="ty-btn-secondary disabled:opacity-40" disabled={page >= pages} onClick={() => changePage(page + 1)} data-testid="shop-next-page">{t('search.next_page')}</button>
            </nav>}
          </div>
        </div>
      </div>
    </main>
  );
}
