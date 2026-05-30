import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Categories, Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';

const SKELETON_KEYS = ['c-1', 'c-2', 'c-3', 'c-4', 'c-5', 'c-6', 'c-7', 'c-8'];

function SubChip({ active, onClick, children }) {
  const cls = active
    ? 'bg-[#E10600] text-white border border-[#E10600]'
    : 'border border-[#232B3A] text-ty-textMid hover:border-[#2E394D] hover:text-white';
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="subcategory-chip"
      className={`px-3.5 h-9 rounded-full text-xs font-mono uppercase tracking-[0.2em] transition-all ${cls}`}
    >
      {children}
    </button>
  );
}

function ProductsBody({ loading, products }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SKELETON_KEYS.map((k) => (
          <div key={k} className="aspect-[4/5] rounded-2xl bg-[#0F1115] border border-[#151A23] animate-pulse" />
        ))}
      </div>
    );
  }
  if (products.length === 0) {
    return <div className="py-20 text-center text-ty-textMid">No products in this filter.</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((p, idx) => (
        <Reveal key={p.id} delay={(idx % 8) * 0.04}><ProductCard product={p} index={idx} /></Reveal>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [cat, setCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeSub, setActiveSub] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveSub('');
    Categories.get(slug)
      .then(setCat)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('[TYMotors] category load failed:', e?.message || e);
        setCat(null);
      });
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    const args = { category: slug, limit: 100 };
    if (activeSub) args.subcategory = activeSub;
    let cancelled = false;
    Products.list(args)
      .then((d) => { if (!cancelled) setProducts(d.items || []); })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('[TYMotors] category products failed:', e?.message || e);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, activeSub]);

  if (!cat) {
    return (
      <main data-testid="page-category" className="pt-28 pb-24">
        <div className="ty-container"><p className="text-ty-textMid">{t('common.loading')}</p></div>
      </main>
    );
  }

  return (
    <main data-testid="page-category" className="pt-20 pb-24">
      <section className="relative aspect-[16/7] md:aspect-[21/8] w-full overflow-hidden">
        <img src={cat.image} alt={cat.name} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/70 to-transparent" />
        <div className="absolute top-6 left-6 h-2 w-2 border-t border-l border-[#F2C94C]" />
        <div className="absolute bottom-6 right-6 h-2 w-2 border-b border-r border-[#F2C94C]" />
        <div className="absolute inset-0 ty-container flex flex-col justify-end pb-10 md:pb-14">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> TYMotors / {cat.name}
          </p>
          <h1 data-testid="category-title" className="ty-display text-white text-4xl md:text-7xl mt-3">{cat.name}.</h1>
          <p className="mt-3 text-ty-textMid max-w-xl">{cat.description}</p>
        </div>
      </section>

      <div className="ty-container mt-10">
        <div className="flex flex-wrap gap-2 mb-8" data-testid="category-subcategories">
          <SubChip active={!activeSub} onClick={() => setActiveSub('')}>All</SubChip>
          {cat.subcategories?.map((s) => (
            <SubChip key={s} active={activeSub === s} onClick={() => setActiveSub(s)}>{s}</SubChip>
          ))}
        </div>
        <ProductsBody loading={loading} products={products} />
      </div>
    </main>
  );
}
