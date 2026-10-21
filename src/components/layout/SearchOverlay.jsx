import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { Armchair, ArrowRight, CarFront, ChevronRight, Monitor, PackageSearch, Search, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/format';
import { responsiveImageProps } from '@/lib/image';
import { productPhoto } from '@/lib/productPhoto';
import { normalizeSearchQuery, searchCatalogueUrl, SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH } from '@/lib/search';
import { useSearchResults } from './useSearchResults';
import { useSearchViewport } from './useSearchViewport';
import './SearchOverlay.css';

// Labels are translated; queries use the existing catalogue vocabulary.
const EXAMPLES = [['grille', 'calandre'], ['carplay', 'carplay'], ['wheel', 'volant'], ['spoiler', 'spoiler'], ['dashcam', 'dashcam']];
const DOMAINS = [
  { slug: 'performance', icon: CarFront },
  { slug: 'interior', icon: Armchair },
  { slug: 'technology', icon: Monitor },
];

function SearchIdeas({ onPick, onSelect, t }) {
  return <div className="search-ideas">
    <section aria-labelledby="search-examples-title">
      <h3 id="search-examples-title" className="search-section-label">{t('search.examples')}</h3>
      <div className="search-example-chips">
        {EXAMPLES.map(([key, query]) => <button type="button" key={key} onClick={() => onPick(query)} data-testid={`search-example-${key}`}>
          {t(`search.terms.${key}`)}<ArrowRight size={14} aria-hidden="true" />
        </button>)}
      </div>
    </section>
    <section aria-labelledby="search-domains-title">
      <h3 id="search-domains-title" className="search-section-label">{t('search.browse')}</h3>
      <nav aria-label={t('search.browse')} className="search-domain-links">
        {DOMAINS.map(({ slug, icon: Icon }) => <Link key={slug} to={`/category/${slug}`} onClick={onSelect}>
          <span className="search-domain-icon"><Icon size={20} aria-hidden="true" /></span>
          <span><strong>{t(`nav.${slug}`)}</strong><span>{t(`search.domains.${slug}`)}</span></span>
          <ChevronRight size={16} aria-hidden="true" />
        </Link>)}
      </nav>
    </section>
    <Link className="search-catalogue-link" to="/shop" onClick={onSelect}>{t('search.catalogue')}<ArrowRight size={16} aria-hidden="true" /></Link>
    <p className="search-compatibility-note">{t('search.compatibility')}</p>
  </div>;
}

function ResultPhoto({ src, name, unavailable }) {
  const [failed, setFailed] = useState(false);
  return <span className="search-result-photo">
    {src && !failed ? <img {...responsiveImageProps(src, [96, 160, 240], '64px')} alt={name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      : <><PackageSearch size={24} aria-hidden="true" /><span className="sr-only">{unavailable}</span></>}
  </span>;
}

function SearchResult({ product, onSelect, language, t }) {
  const image = productPhoto(product.images?.[0]);
  return <li><Link to={`/product/${product.slug}`} onClick={onSelect} className="search-result-link" data-testid="search-result-link">
    <ResultPhoto key={`${product.id}:${image || ''}`} src={image} name={product.name} unavailable={t('search.photo_unavailable')} />
    <span className="search-result-details">
      <strong>{product.name}</strong>
      {product.subtitle && <span className="search-result-subtitle">{product.subtitle}</span>}
      <span className="search-result-price">{formatPrice(product.price, product.currency, language)}
        {product.test_purchase && <span className="search-test-badge">{t('search.test_product')}</span>}
      </span>
    </span>
    <ChevronRight size={18} aria-hidden="true" />
  </Link></li>;
}

function SearchContent({ query, state, onRetry, onPick, onSelect, language, t }) {
  if (query.length < SEARCH_MIN_LENGTH) return <>
    <p id="search-status" className="search-hint" role="status">{query ? t('search.too_short') : t('search.hint')}</p>
    <SearchIdeas onPick={onPick} onSelect={onSelect} t={t} />
  </>;
  if (state.status === 'loading') return <div aria-busy="true">
    <p id="search-status" className="search-hint" role="status">{t('search.loading')}</p>
    <div className="search-skeletons" aria-hidden="true">{[0, 1, 2].map(key => <div key={key} className="search-skeleton"><span /><span /></div>)}</div>
  </div>;
  if (state.status === 'error') return <div className="search-empty-state" role="alert">
    <PackageSearch size={30} aria-hidden="true" /><h3 id="search-status">{t('search.error_title')}</h3><p>{t('search.error_hint')}</p>
    <button type="button" className="search-retry" data-testid="search-retry-button" onClick={onRetry}>{t('search.retry')}</button>
    <Link to={searchCatalogueUrl(query)} onClick={onSelect} className="search-catalogue-link">{t('search.catalogue')}<ArrowRight size={16} aria-hidden="true" /></Link>
  </div>;
  if (!state.items.length) return <div className="search-empty-state">
    <PackageSearch size={32} aria-hidden="true" /><h3 id="search-status" role="status">{t('search.empty_title', { query })}</h3><p>{t('search.empty_hint')}</p>
    <SearchIdeas onPick={onPick} onSelect={onSelect} t={t} />
  </div>;
  return <>
    <div className="search-results-heading"><p id="search-status" role="status">{state.total !== null
      ? t('search.result_count', { count: state.total }) : t('search.shown_count', { count: state.items.length })}</p>
      <span>{t('search.results')}</span>
    </div>
    <ul className="search-results-list" aria-label={t('search.results')}>
      {state.items.map(product => <SearchResult key={product.id} product={product} onSelect={onSelect} language={language} t={t} />)}
    </ul>
    <Link to={searchCatalogueUrl(query)} onClick={onSelect} className="search-all-results" data-testid="search-all-results-link">
      {t('search.view_all')}<ArrowRight size={17} aria-hidden="true" />
    </Link>
    <p className="search-compatibility-note">{t('search.compatibility')}</p>
  </>;
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useApp();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [retry, setRetry] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const query = normalizeSearchQuery(q);
  const state = useSearchResults(searchOpen, query, retry);
  const viewport = useSearchViewport(searchOpen);
  const close = () => setSearchOpen(false);
  useEffect(() => { if (!searchOpen) setQ(''); }, [searchOpen]);
  useEffect(() => { if (resultsRef.current) resultsRef.current.scrollTop = 0; }, [query]);
  const submit = event => {
    event.preventDefault();
    if (query.length < SEARCH_MIN_LENGTH) return;
    close(); navigate(searchCatalogueUrl(query));
  };
  const pick = value => { setQ(value); inputRef.current?.focus({ preventScroll: true }); };

  return <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
    <Dialog.Portal><Dialog.Overlay className="search-backdrop" data-lenis-prevent>
      <Dialog.Content id="ty-search-dialog" aria-modal="true" data-testid="search-overlay" data-lenis-prevent
        className={`search-sheet${viewport && viewport.height < 360 ? ' search-sheet-compact' : ''}`}
        style={viewport ? { height: viewport.height, top: viewport.top, width: viewport.width, left: viewport.left } : undefined}
        onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus({ preventScroll: true }); }}
        onCloseAutoFocus={event => { event.preventDefault(); document.getElementById('ty-search-trigger')?.focus({ preventScroll: true }); }}>
        <header className="search-header"><div><p className="search-brand">TYMotors</p><Dialog.Title>{t('search.title')}</Dialog.Title></div>
          <Dialog.Description className="sr-only">{t('search.description')}</Dialog.Description>
          <Dialog.Close asChild><button type="button" className="search-close" data-testid="search-overlay-close-button" aria-label={t('nav.close')}><X size={20} aria-hidden="true" /></button></Dialog.Close>
        </header>
        <div className="search-toolbar"><form role="search" onSubmit={submit}>
          <label htmlFor="ty-search-input" className="sr-only">{t('search.input_label')}</label>
          <div className="search-field"><Search size={18} aria-hidden="true" />
            <input id="ty-search-input" ref={inputRef} type="search" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" maxLength={SEARCH_MAX_LENGTH}
              data-testid="search-overlay-input" aria-controls="ty-search-results" aria-describedby="search-status"
              value={q} onChange={event => setQ(event.target.value)} placeholder={t('search.placeholder')} />
            {q && <button type="button" className="search-clear" data-testid="search-clear-button" aria-label={t('search.clear')} onClick={() => pick('')}><X size={16} aria-hidden="true" /></button>}
            <button type="submit" className="search-submit" data-testid="search-submit-button" disabled={query.length < SEARCH_MIN_LENGTH} aria-label={t('search.view_all')}><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </form></div>
        <div ref={resultsRef} id="ty-search-results" className="search-scroll" data-testid="search-results-scroll" data-lenis-prevent>
          <div className="search-content"><SearchContent query={query} state={state} onRetry={() => setRetry(value => value + 1)} onPick={pick} onSelect={close} language={i18n.language} t={t} /></div>
        </div>
      </Dialog.Content>
    </Dialog.Overlay></Dialog.Portal>
  </Dialog.Root>;
}
