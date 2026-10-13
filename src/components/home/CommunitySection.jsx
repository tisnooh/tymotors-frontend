import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { EDITORIAL_IMAGES, editorialImageProps } from '@/lib/editorialImages';
import './CommunitySection.css';

const PROJECTS = [
  { id: 'gathering', image: EDITORIAL_IMAGES.gathering, to: '/customize' },
  { id: 'detail', image: EDITORIAL_IMAGES.detail, to: '/category/performance' },
  { id: 'silhouette', image: EDITORIAL_IMAGES.silhouette, to: '/customize' },
];

function InspirationPhoto({ image, alt, sizes }) {
  const [failed, setFailed] = useState(false);
  return <div className="universe-photo">
    {!failed ? <img {...editorialImageProps(image, sizes)} alt={alt} loading="lazy" decoding="async"
      style={{ objectPosition: image.position }} onError={() => setFailed(true)} />
      : <p role="status" className="universe-photo-error">{alt}</p>}
    <span className="universe-photo-shade" aria-hidden="true" />
  </div>;
}

export function CommunitySection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
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
              gsap.from(card, {
                y: 64, rotation: index === 1 ? 2 : -1, opacity: 0, duration: 1.1,
                ease: 'power3.out', clearProps: 'transform,opacity',
                scrollTrigger: { trigger: card, start: 'top 93%', once: true },
              });
              const image = card.querySelector('img');
              if (image) gsap.fromTo(image, { yPercent: -5 }, {
                yPercent: 5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
              });
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
      <div className="universe-grid">
        {PROJECTS.map((project, index) => <article key={project.id} data-testid="community-card"
          className={`universe-card ${index === 0 ? 'universe-card-featured' : ''}`}>
          <div className="universe-image-frame">
            <InspirationPhoto image={project.image} alt={t(`community.projects.${project.id}.alt`)}
              sizes={index === 0 ? '(max-width: 767px) 100vw, 55vw' : '(max-width: 767px) 100vw, 40vw'} />
            <p className="universe-image-label"><span>0{index + 1}</span>{t(`community.projects.${project.id}.label`)}</p>
          </div>
          <div className="universe-card-copy">
            <h3 className="ty-display">{t(`community.projects.${project.id}.title`)}</h3>
            <p>{t(`community.projects.${project.id}.desc`)}</p>
            <Link to={project.to} className="universe-card-link">{t(`community.projects.${project.id}.link`)}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </article>)}
      </div>
      <div className="universe-footer">
        <div><p className="universe-kicker">{t('community.next')}</p><p className="universe-footer-title">{t('community.next_title')}</p></div>
        <Link to="/customize" data-testid="community-customize-cta" className="ty-btn-primary min-h-12 h-auto py-3">{t('community.cta')}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
      <p className="universe-disclaimer">{t('community.disclaimer')}</p>
      <details className="universe-credits"><summary>{t('community.credits')}</summary>
        <a href="https://www.pexels.com/photo/sunset-car-showdown-modified-sedans-on-display-32103160/" target="_blank" rel="noopener noreferrer">FBO Media · Pexels</a>
        <a href="https://www.pexels.com/photo/close-up-of-shiny-custom-car-wheel-31768888/" target="_blank" rel="noopener noreferrer">Bradley de Melo · Pexels</a>
        <a href="https://www.pexels.com/photo/blue-tuned-bmw-car-27118859/" target="_blank" rel="noopener noreferrer">FBO Media · Pexels</a>
      </details>
    </div>
  </section>;
}
