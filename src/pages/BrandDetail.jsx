import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brands, Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import { ArrowRight } from 'lucide-react';
import { HOME_BRAND_PHOTOS } from '@/lib/homeEditorialPhotos';

export default function BrandDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productsError, setProductsError] = useState(false);

  useEffect(() => {
    setCategory('');
    setBrand(null); setLoading(true); setError('');
    let current = true;
    Brands.get(slug).then((data) => { if (current) setBrand(data); })
      .catch((e) => { if (current) setError(e.response?.status === 404 ? 'Marque introuvable' : 'Marque temporairement indisponible'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [slug]);

  useEffect(() => {
    const args = { brand: slug, limit: 100 };
    if (category) args.category = category;
    let current = true; setProducts([]); setProductsError(false);
    Products.list(args).then((d) => { if (current) setProducts(d.items || []); })
      .catch(() => { if (current) setProductsError(true); });
    return () => { current = false; };
  }, [slug, category]);

  if (!brand) {
    return <main data-testid="page-brand-detail" className="pt-28 pb-24 ty-container">{loading ? <p className="text-ty-textMid">{t('common.loading')}</p> : <><h1 className="ty-display text-white text-3xl">{error || 'Marque introuvable'}</h1><Link className="ty-btn-line mt-6" to="/brands">Retour aux marques</Link></>}</main>;
  }

  const photo = HOME_BRAND_PHOTOS[slug];
  return (
    <main data-testid="page-brand-detail" className="pt-16 lg:pt-20 pb-24">
      <section data-testid="catalog-hero" className="relative lg:aspect-[21/7] w-full overflow-hidden">
        {(photo || brand.image) && <img
          key={photo?.src || brand.image}
          src={photo ? photo.src : brand.image}
          width={photo?.width} height={photo?.height}
          alt={photo ? t(photo.altKey) : brand.name}
          decoding="async"
          onError={event => { event.currentTarget.hidden = true; }}
          className="absolute inset-0 h-full w-full object-cover opacity-55" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/85 via-transparent to-transparent" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[#E10600]/20 blur-[120px]" />

        <div data-testid="catalog-hero-content" className="relative lg:absolute lg:inset-0 ty-container flex flex-col justify-end py-8 lg:pt-0 lg:pb-12">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> TYMotors / {brand.name}
          </p>
          <h1 data-testid="brand-detail-title" className="ty-display text-white text-[clamp(2rem,9vw,3rem)] md:text-6xl lg:text-8xl break-words mt-4">{brand.name}.</h1>
          <p className="mt-4 text-ty-textMid max-w-xl">{brand.description}</p>
          <Link to="/customize" className="mt-6 ty-btn-line min-h-11 h-auto py-3 md:h-11 md:py-0 text-xs uppercase tracking-[0.18em] w-fit max-w-full">
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

        {productsError ? <p role="alert" className="text-ty-textMid">Les produits sont temporairement indisponibles.</p> : products.length === 0 ? (
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
