import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';

export function FeaturedProducts() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    Products.list({ featured: true, limit: 8 })
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <section data-testid="featured-products-section" className="relative ty-section">
      <div className="ty-container">
        <Reveal className="mb-12">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('featured.eyebrow')}
              </p>
              <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('featured.title')}</h2>
              <p className="mt-3 text-ty-textMid max-w-xl">{t('featured.sub')}</p>
            </div>
            <Link to="/shop" data-testid="featured-view-all-button" className="ty-btn-ghost h-11 text-xs uppercase tracking-[0.18em]">
              {t('featured.view_all')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {items.map((p, idx) => (
            <Reveal key={p.id} delay={(idx % 4) * 0.05}>
              <ProductCard product={p} index={idx} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
