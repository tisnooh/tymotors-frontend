import React, { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StorytellingSection.css';

gsap.registerPlugin(ScrollTrigger);

const BEAT_IMAGES = [
  'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1658055467065-073f0e1d0601?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1719780711623-6a55225017c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1639928845095-b2c86c3cde80?auto=format&fit=crop&w=1200&q=80',
];

export function StorytellingSection() {
  const { t } = useTranslation();
  const beats = t('story.beats', { returnObjects: true });
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return undefined;

    const cards = Array.from(track.querySelectorAll('.storytelling-card'));
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({
        phone: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      }, ({ conditions }) => {
        const { phone, reduceMotion } = conditions;
        if (!phone || !ScrollTrigger.isTouch) return undefined;

        section.classList.add('storytelling-touch-layout');

        if (reduceMotion || cards.length < 2) {
          return () => section.classList.remove('storytelling-touch-layout');
        }

        section.classList.add('storytelling-touch-active');
        gsap.set(cards, { zIndex: (index) => index + 1 });
        gsap.set(cards.slice(1), { yPercent: 100 });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: viewport,
            start: 'top top',
            end: () => `+=${Math.max(1, viewport.clientHeight * (cards.length - 1))}`,
            pin: viewport,
            pinSpacing: true,
            scrub: 0.35,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        cards.slice(1).forEach((card, index) => {
          timeline.to(card, { yPercent: 0, duration: 1 }, index);
        });

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set(cards, { clearProps: 'transform,z-index' });
          section.classList.remove('storytelling-touch-active', 'storytelling-touch-layout');
        };
      });
    }, section);

    return () => {
      media.revert();
      context.revert();
    };
  }, [beats.length]);

  return (
    <section ref={sectionRef} data-testid="scroll-story-section" className="storytelling-section bg-[#050608] py-16 md:py-24">
      <div className="ty-container">
        <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
          <span className="h-px w-8 bg-[#F2C94C]" /> {t('story.eyebrow')}
        </p>
        <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('story.title')}</h2>
        <p className="mt-3 max-w-2xl text-sm text-ty-textMid">Découvrez chaque transformation au fil de votre parcours.</p>
      </div>

      <div ref={viewportRef} className="storytelling-viewport">
        <div ref={trackRef} className="storytelling-track mt-8 flex gap-4 overflow-x-auto px-[max(1.25rem,calc((100vw-80rem)/2))] pb-5 snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:#E10600_#151A23]">
          {beats.map((beat, index) => (
            <article key={beat.title} className="storytelling-card relative shrink-0 w-[82vw] sm:w-[55vw] lg:w-[31rem] aspect-[4/3] overflow-hidden rounded-2xl border border-[#232B3A] snap-start">
              <img src={BEAT_IMAGES[index]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/45 to-transparent" />
              <div className="storytelling-card-content relative flex h-full items-end p-6 md:p-8">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E10600] text-white font-mono text-xs">0{index + 1}</span>
                  <div>
                    <h3 className="text-white ty-display text-xl">{beat.title}</h3>
                    <p className="mt-1 text-sm text-ty-textMid">{beat.desc}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
