import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';
import './FeaturedProducts.css';

const PRODUCT_LIMIT = 8;

function responseItems(response) {
  if (!Array.isArray(response?.items)) throw new Error('Invalid catalogue response');
  return response.items;
}

export function FeaturedProducts() {
  const { t } = useTranslation();
  const id = useId();
  const railRef = useRef(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [usesCatalogue, setUsesCatalogue] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [position, setPosition] = useState({ previous: false, next: false });

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setItems([]);
    setUsesCatalogue(false);

    async function loadProducts() {
      try {
        const featured = responseItems(await Products.list({ featured: true, limit: PRODUCT_LIMIT }));
        if (!active) return;
        // Keep editorial choices first, but do not leave the home catalogue blank
        // just because no reference is currently flagged as featured in the base.
        const products = featured.length ? featured : responseItems(await Products.list({ limit: PRODUCT_LIMIT }));
        if (!active) return;
        setItems(products);
        setUsesCatalogue(!featured.length);
        setStatus(products.length ? 'ready' : 'empty');
      } catch {
        if (active) setStatus('error');
      }
    }

    loadProducts();
    return () => { active = false; };
  }, [attempt]);

  const updatePosition = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const next = {
      previous: rail.scrollLeft > 2,
      next: rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2,
    };
    setPosition(current => current.previous === next.previous && current.next === next.next ? current : next);
  }, []);

  useEffect(() => {
    if (status !== 'ready') return undefined;
    const rail = railRef.current;
    updatePosition();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(updatePosition);
      observer.observe(rail);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [status, updatePosition]);

  const scrollProducts = useCallback(direction => {
    const rail = railRef.current;
    if (!rail) return;
    const [first, second] = rail.children;
    const step = second ? second.offsetLeft - first.offsetLeft : rail.clientWidth;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (direction === 'start' || direction === 'end') {
      rail.scrollTo({ left: direction === 'start' ? 0 : rail.scrollWidth, behavior });
    } else {
      rail.scrollBy({ left: direction * step, behavior });
    }
  }, []);

  const onRailKeyDown = event => {
    // Do not steal arrow keys from the product links or their buttons.
    if (event.target !== event.currentTarget) return;
    const direction = { ArrowLeft: -1, ArrowRight: 1, Home: 'start', End: 'end' }[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    scrollProducts(direction);
  };

  return (
    <section data-testid="featured-products-section" className="relative ty-section" aria-labelledby={`${id}-title`}>
      <div className="ty-container">
        <Reveal className="mb-12">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
                <span className="h-px w-8 bg-[#F2C94C]" /> {t('featured.eyebrow')}
              </p>
              <h2 id={`${id}-title`} className="mt-3 ty-display text-white text-3xl md:text-5xl">{t('featured.title')}</h2>
              <p className="mt-3 text-ty-textMid max-w-xl">{t(usesCatalogue ? 'featured.catalogue_sub' : 'featured.sub')}</p>
            </div>
            <Link to="/shop" data-testid="featured-view-all-button" className="ty-btn-ghost h-11 text-xs uppercase tracking-[0.18em]">
              {t('featured.view_all')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div aria-busy={status === 'loading'}>
          {status === 'loading' && <>
            <p role="status" className="sr-only">{t('featured.loading')}</p>
            <div className="featured-products-rail" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="featured-product-skeleton" />)}
            </div>
          </>}

          {status === 'error' && <div className="featured-products-message">
            <p role="alert">{t('featured.error')}</p>
            <button type="button" onClick={() => setAttempt(current => current + 1)} className="ty-btn-ghost mt-5" data-testid="featured-retry-button">
              {t('featured.retry')}
            </button>
          </div>}

          {status === 'empty' && <p role="status" className="featured-products-message">{t('featured.empty')}</p>}

          {status === 'ready' && <>
            <div className="flex items-center justify-between gap-4 mb-4">
              <p id={`${id}-hint`} className="text-sm text-ty-textMid">{t('featured.scroll_hint')}</p>
              <div className="flex gap-2 shrink-0">
                <button type="button" className="featured-products-arrow" aria-label={t('featured.previous')} aria-controls={`${id}-rail`}
                  data-testid="featured-previous-button" disabled={!position.previous} onClick={() => scrollProducts(-1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" className="featured-products-arrow" aria-label={t('featured.next')} aria-controls={`${id}-rail`}
                  data-testid="featured-next-button" disabled={!position.next} onClick={() => scrollProducts(1)}>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <ul ref={railRef} id={`${id}-rail`} className="featured-products-rail" data-testid="featured-products-rail"
              tabIndex={0} aria-labelledby={`${id}-title`} aria-describedby={`${id}-hint`} data-lenis-prevent=""
              onScroll={updatePosition} onKeyDown={onRailKeyDown}>
              {items.map((product, index) => <li key={product.id} className="featured-product">
                <ProductCard product={product} index={index} />
              </li>)}
            </ul>
          </>}
        </div>
      </div>
    </section>
  );
}
