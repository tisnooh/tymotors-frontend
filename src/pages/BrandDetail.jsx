import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brands, Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import { ArrowRight } from 'lucide-react';

export default function BrandDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    setCategory('');
    Brands.get(slug).then(setBrand).catch(() => setBrand(null));
  }, [slug]);

  useEffect(() => {
    const args = { brand: slug, limit: 100 };
    if (category) args.category = category;
    Products.list(args).then((d) => setProducts(d.items || []));
  }, [slug, category]);

  if (!brand) {
    return <main data-testid="page-brand-detail" className="pt-28 ty-container"><p className="text-ty-textMid">{t('common.loading')}</p></main>;
  }

  return (
    <main data-testid="page-brand-detail" className="pt-20 pb-24">
      <section className="relative aspect-[16/8] md:aspect-[21/7] w-full overflow-hidden">
        <img src={brand.image} alt={brand.name} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/85 via-transparent to-transparent" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[#E10600]/20 blur-[120px]" />

        <div className="absolute inset-0 ty-container flex flex-col justify-end pb-12">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> TYMotors / {brand.name}
          </p>
          <h1 data-testid="brand-detail-title" className="ty-display text-white text-5xl md:text-8xl mt-4">{brand.name}.</h1>
          <p className="mt-4 text-ty-textMid max-w-xl">{brand.description}</p>
          <Link to="/customize" className="mt-6 ty-btn-line h-11 text-xs uppercase tracking-[0.18em] w-fit">
            {t('nav.customize_long')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="ty-container mt-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {['', 'performance', 'interior', 'technology'].map((c) => (
            <button
              key={c || 'all'}
              data-testid="brand-filter-chip"
              onClick={() => setCategory(c)}
              className={`px-3.5 h-9 rounded-full text-xs font-mono uppercase tracking-[0.2em] transition-all ${category === c ? 'bg-[#E10600] text-white border border-[#E10600]' : 'border border-[#232B3A] text-ty-textMid hover:border-[#2E394D]'}`}
            >
              {c ? c : 'All'}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center text-ty-textMid">No products available.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p, idx) => <Reveal key={p.id} delay={(idx % 8) * 0.04}><ProductCard product={p} index={idx} /></Reveal>)}
          </div>
        )}
      </div>
    </main>
  );
}
