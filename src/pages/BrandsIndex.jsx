import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { Brands } from '@/lib/api';
import { Reveal } from '@/components/shared/Reveal';

export default function BrandsIndex() {
  const { t } = useTranslation();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    Brands.list().then(setBrands);
  }, []);

  return (
    <main data-testid="page-brands" className="pt-28 pb-24">
      <div className="ty-container">
        <Reveal className="mb-12 max-w-3xl">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> {t('brands.eyebrow')}
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('brands.title')}</h1>
          <p className="mt-4 text-ty-textMid">{t('brands.sub')}</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((b, idx) => (
            <Reveal key={b.slug} delay={(idx % 6) * 0.05}>
              <Link
                to={`/brands/${b.slug}`}
                data-testid="brand-card-index"
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden bg-[#0A0B0E] border border-[#151A23] hover:border-[#2E394D] transition-colors"
              >
                <img src={b.image} alt={b.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-55 group-hover:opacity-80 transition-all duration-[800ms] group-hover:scale-[1.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/55 to-transparent" />
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80">0{idx + 1}</span>
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="ty-display text-white text-3xl">{b.name}</h3>
                    <p className="text-ty-textMid text-sm mt-2 max-w-xs line-clamp-2">{b.tagline}</p>
                    <div className="mt-4 h-[1.5px] w-12 bg-[#E10600] group-hover:w-24 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
