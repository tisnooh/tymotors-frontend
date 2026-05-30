import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Products, Brands as BrandsApi, Categories as CategoriesApi } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import { SlidersHorizontal } from 'lucide-react';

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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
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

function ProductGridSection({ loading, products, onReset }) {
  if (loading) return <ProductSkeletonGrid />;
  if (products.length === 0) return <EmptyState onReset={onReset} />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
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
  const [mobileFilters, setMobileFilters] = useState(false);

  const brand = params.get('brand') || '';
  const category = params.get('category') || '';

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
    const args = { limit: 100 };
    if (brand) args.brand = brand;
    if (category) args.category = category;
    let cancelled = false;
    Products.list(args)
      .then((d) => {
        if (cancelled) return;
        setProducts(d.items || []);
        setTotal(d.total || 0);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('[TYMotors] products load failed:', e?.message || e);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [brand, category]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key); else next.set(key, value);
    setParams(next);
  };

  const reset = () => setParams(new URLSearchParams());

  // Memoize body to keep parent JSX flat
  const body = useMemo(
    () => <ProductGridSection loading={loading} products={products} onReset={reset} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, products]
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

        <div className="flex items-center justify-between mb-6">
          <p data-testid="shop-results-count" className="font-mono text-xs tracking-wider text-ty-textLow">
            {total} {t('shop.results')}
          </p>
          <button
            type="button"
            onClick={() => setMobileFilters((v) => !v)}
            className="lg:hidden ty-btn-ghost h-10 text-xs tracking-[0.18em] uppercase"
          >
            <SlidersHorizontal className="h-4 w-4" /> {t('shop.filters')}
          </button>
        </div>

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

              <button type="button" onClick={reset} data-testid="shop-reset-button" className="ty-btn-line h-10 w-full text-xs tracking-[0.18em] uppercase">
                {t('shop.reset')}
              </button>
            </div>
          </aside>

          <div className="lg:col-span-9">{body}</div>
        </div>
      </div>
    </main>
  );
}
