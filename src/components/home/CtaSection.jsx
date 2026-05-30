import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';

export function CtaSection() {
  const { t } = useTranslation();
  return (
    <section data-testid="prefooter-cta-section" className="relative ty-section overflow-hidden">
      <div className="ty-container">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden border border-[#232B3A] bg-[#0A0B0E]">
            <img
              src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=2000&q=85"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/85 to-transparent" />
            <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-[#E10600]/25 blur-[120px]" />
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
