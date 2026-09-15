import React, { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StorytellingSection.css';

gsap.registerPlugin(ScrollTrigger);

const BEAT_IMAGES = [
  'https://images.unsplash.com/photo-1760688964691-7de6fe3fff63?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1773709766452-8f96b950bf8f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1639444100617-810c1df608a8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1767729659508-0d29dadd2254?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1747595558629-6a73f97b62d6?auto=format&fit=crop&w=1200&q=80',
];

export function StorytellingSection() {
  const { t } = useTranslation();
  const beats = t('story.beats', { returnObjects: true });
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const currentBeatRef = useRef(null);
  const progressRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return undefined;

    const cards = Array.from(track.querySelectorAll('.storytelling-card'));
    const images = cards.map((card) => card.querySelector('img'));
    const contents = cards.map((card) => card.querySelector('.storytelling-card-content'));
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({
        phone: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      }, ({ conditions }) => {
        const { phone, reduceMotion } = conditions;
        if (!phone || reduceMotion || !ScrollTrigger.isTouch || cards.length < 2) return undefined;

        section.classList.add('storytelling-touch-active');
        gsap.set(cards, { zIndex: (index) => index + 1 });
        gsap.set(cards.slice(1), { yPercent: 100 });
        gsap.set(images, { scale: 1.035, transformOrigin: '50% 50%' });
        gsap.set(images[0], { scale: 1 });
        gsap.set(contents.slice(1), { autoAlpha: 0, y: 28 });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: viewport,
            start: 'top top',
            end: () => `+=${Math.max(1, viewport.clientHeight * 0.92 * (cards.length - 1))}`,
            pin: viewport,
            pinSpacing: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
              const current = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
              if (currentBeatRef.current) {
                currentBeatRef.current.textContent = String(current + 1).padStart(2, '0');
              }
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${progress})`;
              }
            },
          },
        });

        cards.slice(1).forEach((card, index) => {
          const previousImage = images[index];
          const currentImage = images[index + 1];
          const previousContent = contents[index];
          const currentContent = contents[index + 1];

          timeline
            .to(previousImage, { scale: 1.075, duration: 1 }, index)
            .to(previousContent, { autoAlpha: 0, y: -20, duration: 0.26 }, index)
            .to(card, { yPercent: 0, duration: 1, ease: 'power1.inOut' }, index)
            .to(currentImage, { scale: 1, duration: 1, ease: 'power1.out' }, index)
            .to(currentContent, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power1.out' }, index + 0.58);
        });

        let refreshFrame = 0;
        let disposed = false;
        const requestRefresh = () => {
          if (disposed) return;
          window.cancelAnimationFrame(refreshFrame);
          refreshFrame = window.requestAnimationFrame(() => {
            if (!disposed) ScrollTrigger.refresh();
          });
        };

        const pendingImages = images.filter((image) => image && !image.complete);
        pendingImages.forEach((image) => image.addEventListener('load', requestRefresh, { once: true }));
        document.fonts?.ready.then(requestRefresh);

        return () => {
          disposed = true;
          window.cancelAnimationFrame(refreshFrame);
          pendingImages.forEach((image) => image.removeEventListener('load', requestRefresh));
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set(cards, { clearProps: 'transform,z-index,opacity,visibility' });
          gsap.set(images, { clearProps: 'transform' });
          gsap.set(contents, { clearProps: 'transform,opacity,visibility' });
          if (progressRef.current) progressRef.current.style.removeProperty('transform');
          section.classList.remove('storytelling-touch-active');
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
      <div ref={viewportRef} className="storytelling-viewport">
        <div className="storytelling-header ty-container">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> {t('story.eyebrow')}
          </p>
          <h2 className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('story.title')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ty-textMid">Découvrez chaque transformation au fil de votre parcours.</p>
        </div>

        <div ref={trackRef} className="storytelling-track mt-8 flex gap-4 overflow-x-auto px-[max(1.25rem,calc((100vw-80rem)/2))] pb-5 snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:#E10600_#151A23]">
          {beats.map((beat, index) => (
            <article key={beat.title} className="storytelling-card relative shrink-0 w-[82vw] sm:w-[55vw] lg:w-[31rem] aspect-[4/3] overflow-hidden rounded-2xl border border-[#232B3A] snap-start">
              <img
                src={BEAT_IMAGES[index]}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="storytelling-card-shade absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/45 to-transparent" />
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

        <div className="storytelling-progress" aria-hidden="true">
          <span ref={currentBeatRef}>01</span>
          <span className="storytelling-progress-rail">
            <span ref={progressRef} className="storytelling-progress-fill" />
          </span>
          <span>{String(beats.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
}
