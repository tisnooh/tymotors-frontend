import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { Brands } from '@/lib/api';
import { Reveal } from '@/components/shared/Reveal';
import './HomeEditorial.css';

export function BrandsSection() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    Brands.list().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <section data-testid="brands-section" className="relative ty-section">
      <div className="ty-container">
        <Reveal className="home-section-heading">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('brands.eyebrow')}
              </p>
              <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('brands.title')}</h2>
            </div>
            <p className="max-w-md text-sm md:text-base text-ty-textMid">{t('brands.sub')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((b, idx) => (
            <Reveal key={b.slug} delay={idx * 0.05}>
              <Link
                to={`/brands/${b.slug}`}
                data-testid="brand-card"
                className="home-brand-card group relative block aspect-[4/3] md:aspect-[5/4] rounded-2xl overflow-hidden border border-[#151A23] hover:border-[#2E394D] transition-colors"
              >
                <div className="home-brand-copy relative h-full w-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span aria-hidden="true" className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 flex items-center gap-2">
                      <span className="h-px w-6 bg-[#F2C94C]/80" /> 0{idx + 1}
                    </span>
                    <span aria-hidden="true" className="h-9 w-9 rounded-full border border-[#232B3A] inline-flex items-center justify-center text-white/80 group-hover:text-white group-hover:border-[#E10600] transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <h3 className="home-brand-name ty-display text-white">{b.name}</h3>
                    <p className="text-xs md:text-sm text-ty-textMid mt-1.5 max-w-[14rem] line-clamp-2">{b.tagline}</p>
                    <div className="mt-3 h-[1.5px] w-12 bg-[#E10600] group-hover:w-24 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
