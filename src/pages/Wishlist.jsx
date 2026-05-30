import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';

export default function Wishlist() {
  const { t } = useTranslation();
  const { wishlist } = useApp();

  return (
    <main data-testid="page-wishlist" className="pt-28 pb-24">
      <div className="ty-container">
        <Reveal className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> Saved
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('wishlist.title')}</h1>
        </Reveal>

        {wishlist.items.length === 0 ? (
          <div data-testid="wishlist-empty-state" className="py-20 text-center max-w-md mx-auto">
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]">// EMPTY //</p>
            <h2 className="mt-3 ty-display text-white text-3xl">{t('wishlist.empty')}</h2>
            <Link to="/shop" className="mt-6 inline-flex ty-btn-primary h-11 text-xs uppercase tracking-[0.18em]">{t('wishlist.continue')}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {wishlist.items.map((p, idx) => (
              <Reveal key={p.id} delay={(idx % 8) * 0.04}><ProductCard product={p} index={idx} /></Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
