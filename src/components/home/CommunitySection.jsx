import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { HOME_PHOTOS } from '@/lib/homeEditorialPhotos';
import { HomeEditorialPhoto } from './HomeEditorialPhoto';
import './CommunitySection.css';

const PROJECTS = [
  { id: 'gathering', image: HOME_PHOTOS.culture, to: '/customize' },
  { id: 'detail', image: HOME_PHOTOS.detail, to: '/category/performance' },
  { id: 'silhouette', image: HOME_PHOTOS.sport, to: '/customize' },
];

export function CommunitySection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const [selected, setSelected] = useState(null);
  const selectCard = (index) => {
    setSelected(current => current === index ? null : index);
    cardRefs.current[index]?.scrollIntoView?.({
      block: 'nearest', inline: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return undefined;
    let disposed = false;
    let media;
    let context;
    // Default-visible: import failure/reduced motion never leaves empty cards.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
        if (disposed) return;
        const gsap = gsapModule.default;
        const { ScrollTrigger } = triggerModule;
        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {
          media = gsap.matchMedia();
          media.add('(prefers-reduced-motion: no-preference)', () => {
            const cards = Array.from(section.querySelectorAll('.universe-card'));
            gsap.from(section.querySelectorAll('.universe-heading > *'), {
              y: 32, opacity: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 90%', once: true },
            });
            cards.forEach((card, index) => {
              // Mobile selection owns the card transform; entrance motion stays on desktop.
              if (window.matchMedia('(max-width: 767px)').matches) return;
              gsap.from(card, {
                y: 64, rotation: index === 1 ? 2 : -1, opacity: 0, duration: 1.1,
                ease: 'power3.out', clearProps: 'transform,opacity',
                scrollTrigger: { trigger: card, start: 'top 93%', once: true },
              });
              // Animate the card, not the photograph: the whole subject stays visible.
            });
            gsap.fromTo(section.querySelector('.universe-road-fill'), { scaleX: 0 }, {
              scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 85%', end: 'bottom 65%', scrub: 0.5 },
            });
          });
        }, section);
      }).catch(() => { media?.revert(); context?.revert(); /* Restore static content after partial initialization, too. */ });
    }, { rootMargin: '250px 0px' });
    observer.observe(section);
    return () => { disposed = true; observer.disconnect(); media?.revert(); context?.revert(); };
  }, []);

  return <section ref={sectionRef} data-testid="community-section" className="universe-section ty-section">
    <div className="ty-container">
      <div className="universe-heading">
        <p className="universe-kicker"><span />{t('community.eyebrow')}</p>
        <h2 className="ty-display">{t('community.title')}</h2>
        <p className="universe-sub">{t('community.sub')}</p>
      </div>
      <div className="universe-road" aria-hidden="true"><span className="universe-road-fill" /></div>
      <p className="universe-swipe-hint">{t('community.swipe_hint')}</p>
      <div className="universe-grid" role="region" tabIndex={0} aria-label={t('community.gallery')} data-lenis-prevent="">
        {PROJECTS.map((project, index) => <article key={project.id} data-testid="community-card"
          ref={element => { cardRefs.current[index] = element; }}
          className={`universe-card ${index === 0 ? 'universe-card-featured' : ''} ${selected === index ? 'is-selected' : ''}`}>
          <div className="universe-image-frame">
            <HomeEditorialPhoto photo={project.image} className="universe-photo" />
            <span className="universe-photo-shade" aria-hidden="true" />
            <p className="universe-image-label"><span>0{index + 1}</span>{t(`community.projects.${project.id}.label`)}</p>
            <button type="button" className="universe-select" aria-pressed={selected === index}
              aria-label={t(selected === index ? 'community.reduce_card' : 'community.select_card', { title: t(`community.projects.${project.id}.title`) })}
              onClick={() => selectCard(index)} />
          </div>
          <div className="universe-card-copy">
            <h3 className="ty-display">{t(`community.projects.${project.id}.title`)}</h3>
            <p>{t(`community.projects.${project.id}.desc`)}</p>
            <Link to={project.to} className="universe-card-link">{t(`community.projects.${project.id}.link`)}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
