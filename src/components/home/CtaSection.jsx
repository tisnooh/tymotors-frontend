import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import './HomeEditorial.css';

export function CtaSection() {
  const { t } = useTranslation();
  return (
    <section data-testid="prefooter-cta-section" className="relative ty-section overflow-hidden">
      <div className="ty-container">
        <Reveal>
          <div className="home-collection-cta relative rounded-3xl overflow-hidden border border-[#232B3A]">
            <div className="home-collection-cta-art" aria-hidden="true" />
            <div className="absolute top-6 left-6 h-2 w-2 border-t border-l border-[#F2C94C]" />
            <div className="absolute bottom-6 left-6 h-2 w-2 border-b border-l border-[#F2C94C]" />
            <div className="absolute top-6 right-6 h-2 w-2 border-t border-r border-[#F2C94C]" />
            <div className="absolute bottom-6 right-6 h-2 w-2 border-b border-r border-[#F2C94C]" />

            <div className="relative px-6 sm:px-10 md:px-16 py-16 md:py-24 max-w-3xl">
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('cta.eyebrow')}
              </p>
              <h2 className="mt-4 ty-display text-white text-4xl md:text-6xl leading-[0.95]">
                {t('cta.title')}
              </h2>
              <p className="mt-4 text-ty-textMid text-base md:text-lg max-w-xl">{t('cta.sub')}</p>
              <Link
                to="/shop"
                data-testid="prefooter-cta-button"
                className="mt-8 ty-btn-primary h-12 px-6 text-sm tracking-[0.18em] uppercase"
              >
                {t('cta.button')} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
