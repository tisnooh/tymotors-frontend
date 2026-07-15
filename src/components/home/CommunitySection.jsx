import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/shared/Reveal';

const CARDS = [
  { id: 'inspiration-1', src: 'https://images.unsplash.com/photo-1639928197975-719885038475?auto=format&fit=crop&w=1200&q=80' },
  { id: 'inspiration-2', src: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80' },
  { id: 'inspiration-3', src: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80' },
  { id: 'inspiration-4', src: 'https://images.unsplash.com/photo-1639928846767-2b900c357a30?auto=format&fit=crop&w=1200&q=80' },
  { id: 'inspiration-5', src: 'https://images.unsplash.com/photo-1701012187548-03b07619ba48?auto=format&fit=crop&w=1200&q=80' },
  { id: 'inspiration-6', src: 'https://images.unsplash.com/photo-1639928846190-9d342619118a?auto=format&fit=crop&w=1200&q=80' },
];

function CommunityCard({ card, delay }) {
  return (
    <Reveal delay={delay}>
      <div data-testid="community-card" className="group relative block aspect-square rounded-xl overflow-hidden border border-[#151A23] hover:border-[#2E394D] transition-colors bg-[#0A0B0E] ty-card-image">
        <img src={card.src} alt="Inspiration automobile TYMotors" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
      </div>
    </Reveal>
  );
}

export function CommunitySection() {
  const { t } = useTranslation();
  return (
    <section data-testid="community-section" className="relative ty-section">
      <div className="ty-container">
        <Reveal className="mb-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('community.eyebrow')}
              </p>
              <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('community.title')}</h2>
            </div>
            <p className="text-ty-textMid max-w-md text-sm md:text-base">{t('community.sub')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CARDS.map((c, i) => <CommunityCard key={c.id} card={c} delay={(i % 6) * 0.05} />)}
        </div>
      </div>
    </section>
  );
}
