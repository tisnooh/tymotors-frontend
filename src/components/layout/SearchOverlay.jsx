import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Products } from '@/lib/api';
import { formatPrice } from '@/lib/format';

const SUGGESTIONS = ['Carbon grille', 'M Performance', 'CarPlay', 'AMG', 'Steering wheel', 'Dashcam'];
const SEARCH_DEBOUNCE_MS = 220;
const MIN_QUERY_LENGTH = 2;

function SearchHeader({ onClose, closeLabel }) {
  return (
    <div className="ty-container pt-8 pb-6 flex items-center justify-between">
      <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/70">
        <span className="inline-block h-px w-6 bg-[#F2C94C]/70 align-middle mr-3" /> TYMotors Search
      </span>
      <button
        type="button"
        onClick={onClose}
        data-testid="search-overlay-close-button"
        className="h-10 w-10 rounded-full border border-[#232B3A] flex items-center justify-center text-ty-textMid hover:text-white"
        aria-label={closeLabel}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder, inputRef }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ty-textLow" />
      <input
        ref={inputRef}
        data-testid="search-overlay-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-16 pl-12 pr-4 rounded-2xl bg-[#0F1115] border border-[#232B3A] text-2xl font-display text-white placeholder:text-ty-textLow focus:border-[#E10600] transition-colors"
      />
    </div>
  );
}

function SearchSuggestions({ onPick }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-ty-textLow mb-3">Suggestions</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="px-3 h-9 rounded-full border border-[#232B3A] text-sm text-ty-textMid hover:text-white hover:border-[#2E394D] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchResultItem({ product, onSelect, language }) {
  return (
    <li>
      <Link to={`/product/${product.slug}`} onClick={onSelect} className="flex items-center gap-4 py-4 group">
        <div className="h-14 w-20 rounded-lg overflow-hidden bg-[#0F1115] border border-[#151A23] shrink-0">
          {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm md:text-base font-medium truncate group-hover:text-[#FF1A12] transition-colors">{product.name}</div>
          <div className="text-xs text-ty-textLow truncate">{product.subtitle}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-white text-sm font-mono">{formatPrice(product.price, product.currency, language)}</div>
        </div>
      </Link>
    </li>
  );
}

function SearchResults({ loading, q, results, onSelect, language, loadingLabel }) {
  if (loading) return <p className="text-sm text-ty-textLow">{loadingLabel}</p>;
  if (!loading && results.length === 0 && q.length > 1) {
    return <p className="text-sm text-ty-textLow">No results.</p>;
  }
  return (
    <ul className="divide-y divide-[#151A23]">
      {results.map((p) => (
        <SearchResultItem key={p.id} product={p} onSelect={onSelect} language={language} />
      ))}
    </ul>
  );
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useApp();
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounce = useRef(null);

  const handleClose = useCallback(() => setSearchOpen(false), [setSearchOpen]);

  // Lock body scroll + focus input when opening
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      const tmr = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(tmr);
    }
    document.body.style.overflow = '';
    setQ('');
    setResults([]);
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchOpen) return undefined;
    if (debounce.current) clearTimeout(debounce.current);
    if (!q || q.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return undefined;
    }
    debounce.current = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await Products.list({ q, limit: 8 });
        setResults(data.items || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[TYMotors] search failed:', e?.message || e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q, searchOpen]);

  // Escape to close
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, handleClose]);

  if (!searchOpen) return null;

  const placeholder = i18n.language?.startsWith('fr')
    ? 'Rechercher des pi\u00e8ces, marques\u2026'
    : 'Search parts, brands\u2026';

  return (
    <div data-testid="search-overlay" className="fixed inset-0 z-[95] bg-[rgba(5,6,8,0.95)] backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600]/50 to-transparent" />
      <SearchHeader onClose={handleClose} closeLabel={t('nav.close')} />
      <div className="ty-container">
        <SearchInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          inputRef={inputRef}
        />
        <div className="mt-10">
          {!q && <SearchSuggestions onPick={setQ} />}
          {q && (
            <div className="mt-2 max-h-[65vh] overflow-y-auto pr-2">
              <SearchResults
                loading={loading}
                q={q}
                results={results}
                onSelect={handleClose}
                language={i18n.language}
                loadingLabel={t('common.loading')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
