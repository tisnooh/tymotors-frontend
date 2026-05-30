import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BEAT_IMAGES = [
  'https://images.unsplash.com/photo-1605283176568-9b41fde3eba3?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1611740801993-2c9c8c4b6e1b?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=2000&q=85',
];

function CornerBrackets() {
  return (
    <>
      <div className="pointer-events-none absolute top-10 left-10 h-2 w-2 border-t border-l border-[#F2C94C]" />
      <div className="pointer-events-none absolute top-10 right-10 h-2 w-2 border-t border-r border-[#F2C94C]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-2 w-2 border-b border-l border-[#F2C94C]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-2 w-2 border-b border-r border-[#F2C94C]" />
    </>
  );
}

export function StorytellingSection() {
  const { t } = useTranslation();
  const beats = t('story.beats', { returnObjects: true });
  const sectionRef = useRef(null);
  const imagesRef = useRef([]);
  const beatsRef = useRef([]);
  imagesRef.current = [];
  beatsRef.current = [];

  const addImage = (el) => el && !imagesRef.current.includes(el) && imagesRef.current.push(el);
  const addBeat = (el) => el && !beatsRef.current.includes(el) && beatsRef.current.push(el);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const ctx = gsap.context(() => {
      const totalBeats = imagesRef.current.length;
      imagesRef.current.forEach((img, i) => {
        gsap.set(img, i === 0 ? { autoAlpha: 1, scale: 1 } : { autoAlpha: 0, scale: 1.1 });
      });
      beatsRef.current.forEach((bt, i) => {
        gsap.set(bt, { autoAlpha: i === 0 ? 1 : 0, y: 12 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalBeats * 55}%`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 1; i < totalBeats; i++) {
        tl.to(imagesRef.current[i - 1], { autoAlpha: 0, scale: 1.1, duration: 0.6 }, '>')
          .to(beatsRef.current[i - 1], { autoAlpha: 0, y: -20, duration: 0.35 }, '<-0.2')
          .to(imagesRef.current[i], { autoAlpha: 1, scale: 1, duration: 0.6 }, '<+0.1')
          .to(beatsRef.current[i], { autoAlpha: 1, y: 0, duration: 0.5 }, '<+0.15');
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-testid="scroll-story-section" className="relative h-[100svh] w-full overflow-hidden bg-[#050608]">
      {BEAT_IMAGES.map((src) => (
        <div key={src} ref={addImage} className="absolute inset-0">
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/55 to-[#050608]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/85 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-6 md:inset-10 border border-[#F2C94C]/15 rounded-3xl" />
      <CornerBrackets />

      <div className="relative h-full w-full ty-container flex flex-col justify-end pb-24">
        <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
          <span className="h-px w-8 bg-[#F2C94C]" /> {t('story.eyebrow')}
        </p>
        <h2 className="mt-3 ty-display text-white text-3xl md:text-6xl mb-8">{t('story.title')}</h2>
        <div className="relative h-44 md:h-32">
          {beats.map((beat, i) => (
            <div key={beat.title} ref={addBeat} className="absolute inset-0 max-w-2xl">
              <div className="flex items-start gap-4">
                <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E10600] text-white font-mono text-xs">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-white ty-display text-xl md:text-3xl">{beat.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-ty-textMid max-w-xl">{beat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
