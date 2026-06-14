import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BEAT_IMAGES = [
  'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1658055467065-073f0e1d0601?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1719780711623-6a55225017c5?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1639928845095-b2c86c3cde80?auto=format&fit=crop&w=2000&q=85',
];

function CornerBrackets() {
  return (
    <>
      <div className="pointer-events-none absolute top-8 left-8 h-3 w-3 border-t-2 border-l-2 border-[#F2C94C]/60" />
      <div className="pointer-events-none absolute top-8 right-8 h-3 w-3 border-t-2 border-r-2 border-[#F2C94C]/60" />
      <div className="pointer-events-none absolute bottom-8 left-8 h-3 w-3 border-b-2 border-l-2 border-[#F2C94C]/60" />
      <div className="pointer-events-none absolute bottom-8 right-8 h-3 w-3 border-b-2 border-r-2 border-[#F2C94C]/60" />
    </>
  );
}

// MOBILE : version originale pin:true — inchangée
function StorytellingMobile({ beats, t }) {
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
      <div className="pointer-events-none absolute inset-6 border border-[#F2C94C]/15 rounded-3xl" />
      <CornerBrackets />
      <div className="relative h-full w-full ty-container flex flex-col justify-end pb-24">
        <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
          <span className="h-px w-8 bg-[#F2C94C]" /> {t('story.eyebrow')}
        </p>
        <h2 className="mt-3 ty-display text-white text-3xl mb-8">{t('story.title')}</h2>
        <div className="relative h-44">
          {beats.map((beat, i) => (
            <div key={beat.title} ref={addBeat} className="absolute inset-0 max-w-2xl">
              <div className="flex items-start gap-4">
                <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E10600] text-white font-mono text-xs">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-white ty-display text-xl">{beat.title}</h3>
                  <p className="mt-2 text-sm text-ty-textMid max-w-xl">{beat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// DESKTOP : horizontal scroll pinné — cards défilent latéralement
function StorytellingDesktop({ beats, t }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const totalWidth = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} data-testid="scroll-story-section" className="overflow-hidden bg-[#050608]">
      <div ref={trackRef} className="flex h-screen will-change-transform">

        {/* Première card : titre + beat 01 */}
        <div className="relative shrink-0 w-screen h-screen overflow-hidden">
          <img src={BEAT_IMAGES[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/80 via-transparent to-transparent" />
          <CornerBrackets />
          <div className="relative h-full flex flex-col justify-end pb-24 pl-20 max-w-2xl">
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-[#F2C94C]" /> {t('story.eyebrow')}
            </p>
            <h2 className="ty-display text-white text-6xl mb-10">{t('story.title')}</h2>
            <div className="flex items-start gap-4">
              <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E10600] text-white font-mono text-xs">
                01
              </span>
              <div>
                <h3 className="text-white ty-display text-2xl">{beats[0]?.title}</h3>
                <p className="mt-2 text-base text-ty-textMid">{beats[0]?.desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards 02 → 06 */}
        {beats.slice(1).map((beat, i) => (
          <div key={beat.title} className="relative shrink-0 w-screen h-screen overflow-hidden">
            <img src={BEAT_IMAGES[i + 1]} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608]/90 via-[#050608]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/70 via-transparent to-transparent" />
            <CornerBrackets />
            <div className="relative h-full flex flex-col justify-end pb-24 pl-20 max-w-xl">
              <div className="flex items-start gap-4">
                <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E10600] text-white font-mono text-xs">
                  0{i + 2}
                </span>
                <div>
                  <h3 className="text-white ty-display text-3xl mb-2">{beat.title}</h3>
                  <p className="text-base text-ty-textMid">{beat.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export function StorytellingSection() {
  const { t } = useTranslation();
  const beats = t('story.beats', { returnObjects: true });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile
    ? <StorytellingMobile beats={beats} t={t} />
    : <StorytellingDesktop beats={beats} t={t} />;
}
