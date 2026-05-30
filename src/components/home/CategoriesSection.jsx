import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Categories } from '@/lib/api';
import { Reveal } from '@/components/shared/Reveal';

export function CategoriesSection() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    Categories.list().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <section data-testid="categories-section" className="relative ty-section bg-[#070809]">
      <div className="ty-container">
        <Reveal className="mb-12">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('categories.eyebrow')}
              </p>
              <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('categories.title')}</h2>
            </div>
            <p className="max-w-md text-sm md:text-base text-ty-textMid">{t('categories.sub')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((c, idx) => (
            <Reveal key={c.slug} delay={idx * 0.08}>
              <Link
                to={`/category/${c.slug}`}
                data-testid="category-card"
                className="group relative block aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden bg-[#0A0B0E] border border-[#151A23] hover:border-[#2E394D] transition-colors"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-[800ms] group-hover:scale-[1.06] group-hover:opacity-95 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/55 to-transparent" />
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]">0{idx + 1}{' \u2014 '}{c.name}</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                  <h3 className="ty-display text-white text-3xl md:text-5xl">{c.name}</h3>
                  <p className="text-ty-textMid mt-2 text-sm md:text-base max-w-md">{c.tagline}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm text-white">
                    <span className="tracking-[0.18em] uppercase text-xs">{t('categories.explore')}</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E10600] group-hover:bg-[#FF1A12] transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-1/3 bg-[#F2C94C] group-hover:w-2/3 transition-all duration-500" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
