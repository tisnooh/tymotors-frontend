import React, { useEffect, useRef } from 'react';
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
      <div className="pointer-events-none absolute top-10 left-10 h-2 w-2 border-t border-l border-[#F2C94C]" />
      <div className="pointer-events-none absolute top-10 right-10 h-2 w-2 border-t border-r border-[#F2C94C]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-2 w-2 border-b border-l border-[#F2C94C]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-2 w-2 border-b border-r border-[#F2C94C]" />
    </>
  );
}

// MOBILE : version originale pin:true
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

// DESKTOP : layout 2 colonnes — image à droite sticky, beats à gauche en scroll
function StorytellingDesktop({ beats, t }) {
  const itemsRef = useRef([]);
  itemsRef.current = [];
  const addItem = (el) => el && !itemsRef.current.includes(el) && itemsRef.current.push(el);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const ctx = gsap.context(() => {
      itemsRef.current.forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'top 40%',
              scrub: false,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section data-testid="scroll-story-section" className="bg-[#050608] py-32">
      <div className="ty-container">
        {/* Header */}
        <div className="mb-20">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-[#F2C94C]" /> {t('story.eyebrow')}
          </p>
          <h2 className="ty-display text-white text-6xl">{t('story.title')}</h2>
        </div>

        {/* Grid : beats à gauche, image à droite */}
        <div className="grid grid-cols-2 gap-24 items-start">
          {/* Colonne gauche : liste des beats */}
          <div className="flex flex-col gap-16">
            {beats.map((beat, i) => (
              <div key={beat.title} ref={addItem} className="flex items-start gap-6 opacity-0">
                <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E10600] text-white font-mono text-xs mt-1">
                  0{i + 1}
                </span>
                <div className="border-t border-white/10 pt-4 flex-1">
                  <h3 className="text-white ty-display text-2xl mb-2">{beat.title}</h3>
                  <p className="text-ty-textMid text-base">{beat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Colonne droite : image sticky */}
          <div className="sticky top-24 h-[70vh] overflow-hidden rounded-2xl border border-[#F2C94C]/15">
            <div className="pointer-events-none absolute inset-4 z-10 border border-[#F2C94C]/15 rounded-xl" />
            <CornerBrackets />
            {BEAT_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050608]/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StorytellingSection() {
  const { t } = useTranslation();
  const beats = t('story.beats', { returnObjects: true });
  const [isMobile, setIsMobile] = React.useState(
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
