import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HERO_IMG = 'https://images.unsplash.com/photo-1611821064430-0d40291922d2?auto=format&fit=crop&w=2000&q=85';

export function HeroSection() {
  const { t } = useTranslation();
  const imgRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const eyebrowRef = useRef(null);
  const ctaRef = useRef(null);
  const telemetryRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(eyebrowRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)
        .fromTo(headlineRef.current?.querySelectorAll('.line'), { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.0, stagger: 0.08 }, 0.15)
        .fromTo(subRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.6)
        .fromTo(ctaRef.current?.children || [], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.8)
        .fromTo(telemetryRef.current?.children || [], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 1.1);

      if (!reduced && imgRef.current) {
        gsap.fromTo(
          imgRef.current,
          { scale: 1.08, yPercent: -2 },
          {
            yPercent: 8,
            scale: 1.12,
            ease: 'none',
            scrollTrigger: {
              trigger: imgRef.current,
              start: 'top top',
              end: '+=900',
              scrub: true,
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section data-testid="hero-section" className="relative min-h-[100svh] w-full overflow-hidden bg-[#050608]">
      {/* BG image */}
      <div ref={imgRef} className="absolute inset-0">
        <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
      </div>
      {/* Scrims */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/40 to-transparent" />
      {/* Red side glow */}
      <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[#E10600]/20 blur-[120px]" />
      {/* Subtle grid */}
      <div className="absolute inset-0 ty-grid-lines opacity-[0.05]" />
      {/* Yellow corner accents */}
      <div className="absolute top-24 left-0 h-px w-24 bg-[#F2C94C]/50" />
      <div className="absolute top-24 left-24 h-12 w-px bg-[#F2C94C]/50" />

      <div className="relative ty-container pt-32 pb-20 min-h-[100svh] flex flex-col justify-center">
        <p ref={eyebrowRef} className="font-mono text-[11px] md:text-xs tracking-[0.34em] uppercase text-[#F2C94C] flex items-center gap-3 mb-8">
          <span className="h-px w-10 bg-[#F2C94C]" data-testid="hero-eyebrow"/>
          {t('hero.eyebrow')}
        </p>

        <h1 ref={headlineRef} data-testid="hero-headline" className="ty-display text-white text-[12vw] sm:text-7xl md:text-8xl lg:text-[9.5rem] leading-[0.92] tracking-tight">
          <span className="block overflow-hidden"><span className="line block">{t('hero.headline_1')}</span></span>
          <span className="block overflow-hidden text-white/90">
            <span className="line block">
              <span className="relative">
                {t('hero.headline_2')}
                <span className="absolute -bottom-1 left-0 h-1 w-24 bg-[#E10600]" />
              </span>
            </span>
          </span>
        </h1>

        <p ref={subRef} className="mt-8 max-w-2xl text-base md:text-lg text-ty-textMid leading-relaxed">
          {t('hero.sub')}
        </p>

        <div ref={ctaRef} className="mt-10 flex flex-wrap items-center gap-4">
          <Link to="/shop" data-testid="hero-primary-cta-button" className="ty-btn-primary h-12 px-6 text-sm tracking-[0.18em] uppercase">
            {t('hero.cta_primary')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
          <Link to="/customize" data-testid="hero-secondary-cta-button" className="ty-btn-ghost h-12 px-6 text-sm tracking-[0.18em] uppercase">
            {t('hero.cta_secondary')}
          </Link>
        </div>

        {/* Telemetry strip */}
        <div ref={telemetryRef} data-testid="hero-spec-strip" className="mt-16 md:mt-24 grid grid-cols-3 max-w-2xl gap-4">
          {Object.entries(t('hero.telemetry', { returnObjects: true })).map(([k, v]) => (
            <div key={k} className="relative pl-3 border-l border-[#F2C94C]/30">
              <span className="absolute -left-px top-0 h-2 w-px bg-[#F2C94C]" />
              <p className="font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-[#F2C94C]">{v}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-ty-textLow">{t('hero.scroll')}</span>
          <ChevronDown className="h-4 w-4 text-ty-textLow animate-bounce" />
        </div>
      </div>
    </section>
  );
}
