import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Play, Instagram } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';

const CARDS = [
  { id: 'nico-builds', src: 'https://images.unsplash.com/photo-1605559424843-9e4d1c12b8ed?auto=format&fit=crop&w=1200&q=80', handle: '@nico.builds', likes: '24.1k', kind: 'video' },
  { id: 'tymotors-eu', src: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80', handle: '@tymotors.eu', likes: '18.3k', kind: 'photo' },
  { id: 'lior-garage', src: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', handle: '@lior.garage', likes: '12.8k', kind: 'photo' },
  { id: 'porsche-paris', src: 'https://images.unsplash.com/photo-1611821064430-0d40291922d2?auto=format&fit=crop&w=1200&q=80', handle: '@porscheparis', likes: '32.4k', kind: 'video' },
  { id: 'aki-builds', src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', handle: '@aki.builds', likes: '9.6k', kind: 'photo' },
  { id: 'drift-mtl', src: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=80', handle: '@drift.mtl', likes: '15.2k', kind: 'video' },
];

function CommunityCard({ card, delay }) {
  const Icon = card.kind === 'video' ? Play : Instagram;
  return (
    <Reveal delay={delay}>
      <div data-testid="community-card" className="group relative block aspect-square rounded-xl overflow-hidden border border-[#151A23] hover:border-[#2E394D] transition-colors bg-[#0A0B0E] ty-card-image">
        <img src={card.src} alt={card.handle} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between text-xs">
          <span className="text-white/90 font-mono tracking-wide">{card.handle}</span>
          <span className="text-ty-textMid font-mono flex items-center gap-1"><Heart className="h-3 w-3 text-[#E10600]" />{card.likes}</span>
        </div>
        <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-black/40 border border-[#232B3A] flex items-center justify-center">
          <Icon className="h-3 w-3 text-white" />
        </div>
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
