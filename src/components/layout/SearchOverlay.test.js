/* eslint-env node */
import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import fs from 'fs';
import path from 'path';
import { SearchOverlay } from './SearchOverlay';
import { TestSearchContext } from '@/contexts/AppContext';
import { Products } from '@/lib/api';
import { normalizeSearchQuery, searchCatalogueUrl, SEARCH_DEBOUNCE_MS } from '@/lib/search';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';
import edits from '@/data/productPhotoEdits.json';

let mockLanguage = 'fr';
const mockNavigate = jest.fn();
jest.mock('@/contexts/AppContext', () => {
  const React = require('react'); const TestSearchContext = React.createContext(null);
  return { TestSearchContext, useApp: () => React.useContext(TestSearchContext) };
});
jest.mock('@/lib/api', () => ({ Products: { list: jest.fn() } }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, onClick, ...props }) => <a href={to} {...props} onClick={event => { event.preventDefault(); onClick?.(event); }} />,
  useNavigate: () => mockNavigate,
}), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options = {}) => {
  const locale = require(`@/lib/locales/${mockLanguage}.json`);
  const get = value => value.split('.').reduce((item, part) => item?.[part], locale);
  const text = (options.count !== undefined && get(`${key}_${options.count === 1 ? 'one' : 'other'}`)) || get(key) || key;
  return typeof text === 'string' ? text.replace(/{{(\w+)}}/g, (_, name) => String(options[name] ?? '')) : text;
}, i18n: { language: mockLanguage } }) }));

const part = { id: 'fixture-grille', slug: 'calandre-bmw-f30', name: 'Calandre Sport BMW F30', subtitle: 'BMW Série 3 F30', price: 139, currency: 'EUR', images: ['/grille.png'], test_purchase: true };
function Harness() {
  const [searchOpen, setSearchOpen] = useState(false);
  return <TestSearchContext.Provider value={{ searchOpen, setSearchOpen }}>
    <button id="ty-search-trigger" onClick={() => setSearchOpen(true)}>Ouvrir</button>
    <SearchOverlay /><a href="/background">Arrière-plan</a>
  </TestSearchContext.Provider>;
}
let root, host, viewportDescriptor;
const query = id => document.querySelector(`[data-testid="${id}"]`);
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
async function advance(ms = SEARCH_DEBOUNCE_MS) { await act(async () => { jest.advanceTimersByTime(ms); }); }
async function click(element) { await act(async () => element.click()); await advance(0); }
async function open() { await click(document.getElementById('ty-search-trigger')); }
async function type(value) {
  await act(async () => {
    const input = query('search-overlay-input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; jest.useFakeTimers(); jest.clearAllMocks(); mockLanguage = 'fr';
  viewportDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport'); delete window.visualViewport;
  Products.list.mockResolvedValue({ items: [part], total: 1 });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  await act(async () => root.render(<Harness />)); await advance(0);
});
afterEach(async () => {
  await act(async () => root.unmount()); await act(async () => jest.runOnlyPendingTimers()); host.remove();
  if (viewportDescriptor) Object.defineProperty(window, 'visualViewport', viewportDescriptor); else delete window.visualViewport;
  jest.useRealTimers();
});

test('opens the real labelled modal, focuses a bounded search input and locks only the background', async () => {
  expect(query('search-overlay')).toBeNull(); await open();
  const panel = query('search-overlay'); const input = query('search-overlay-input');
  expect(panel.getAttribute('role')).toBe('dialog'); expect(panel.getAttribute('aria-modal')).toBe('true');
  expect(document.getElementById(panel.getAttribute('aria-labelledby')).textContent).toBe(fr.search.title);
  expect(document.activeElement).toBe(input); expect(input.type).toBe('search'); expect(input.maxLength).toBe(120);
  expect(input.getAttribute('enterkeyhint')).toBe('search'); expect(input.getAttribute('aria-controls')).toBe('ty-search-results');
  expect(input.getAttribute('autocorrect')).toBe('off'); expect(input.getAttribute('autocapitalize')).toBe('none');
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(true); expect(host.getAttribute('aria-hidden')).toBe('true');
  expect(query('search-results-scroll').hasAttribute('data-lenis-prevent')).toBe(true); expect(Products.list).not.toHaveBeenCalled();
});

test('French landing offers useful examples and category links without fake popularity or product calls', async () => {
  await open(); const panel = query('search-overlay');
  expect(panel.textContent).toContain(fr.search.examples); expect(panel.textContent).toContain('Calandre'); expect(panel.textContent).toContain('Volant');
  expect(panel.textContent).not.toContain('Carbon grille'); expect(panel.textContent).not.toContain('No results.');
  expect([...panel.querySelectorAll('.search-domain-links a')].map(link => link.getAttribute('href'))).toEqual(['/category/performance', '/category/interior', '/category/technology']);
  expect(query('search-submit-button').disabled).toBe(true); expect(Products.list).not.toHaveBeenCalled();
});

test('one character and whitespace do not request the API', async () => {
  await open(); await type('  c  '); await advance(1000);
  expect(Products.list).not.toHaveBeenCalled(); expect(query('search-overlay').textContent).toContain(fr.search.too_short);
  expect(query('search-submit-button').disabled).toBe(true);
});

test('debounces typing, trims the request and renders server names, prices, total and original photo URL', async () => {
  Products.list.mockResolvedValue({ items: [part], total: 17 }); await open();
  await type('ca'); await advance(100); await type(' calandre '); await advance(219); expect(Products.list).not.toHaveBeenCalled(); await advance(1);
  expect(Products.list).toHaveBeenCalledTimes(1); expect(Products.list).toHaveBeenCalledWith({ q: 'calandre', limit: 8 });
  const result = query('search-result-link'); expect(result.getAttribute('href')).toBe('/product/calandre-bmw-f30');
  expect(result.textContent).toContain(part.name); expect(result.textContent).toContain('139'); expect(result.textContent).toContain(fr.search.test_product);
  expect(result.querySelector('img').getAttribute('src')).toBe('/grille.png'); expect(query('search-overlay').textContent).toContain('17 résultats');
  expect(query('search-all-results-link').getAttribute('href')).toBe('/shop?q=calandre');
});

test('example chips use the actual catalogue vocabulary and focus the field', async () => {
  await open(); await click(query('search-example-wheel')); await advance();
  expect(Products.list).toHaveBeenCalledWith({ q: 'volant', limit: 8 }); expect(query('search-overlay-input').value).toBe('volant');
  expect(document.activeElement).toBe(query('search-overlay-input'));
});

test('search presents the neutral Golf photo without altering the API product or link', async () => {
  const [source, edit] = Object.entries(edits)[0];
  const golf = { ...part, slug: 'vw-golf7-r-rear-diffuser', images: [source] };
  Products.list.mockResolvedValue({ items: [golf], total: 1 });
  await open(); await type('diffuseur'); await advance();
  const result = query('search-result-link');
  expect(result.querySelector('img').getAttribute('src')).toBe(edit.image);
  expect(result.getAttribute('href')).toBe('/product/vw-golf7-r-rear-diffuser');
  expect(golf.images).toEqual([source]);
});

test('without a server total, only the visible item count is announced', async () => {
  Products.list.mockResolvedValue({ items: [part] }); await open(); await type('calandre'); await advance();
  expect(query('search-overlay').textContent).toContain('1 article affiché');
});

test('empty response is explicit, safely escapes the query and offers useful alternatives', async () => {
  Products.list.mockResolvedValue({ items: [], total: 0 }); await open(); await type('<img src=x onerror=alert(1)>'); await advance();
  expect(query('search-overlay').textContent).toContain('Aucun résultat'); expect(query('search-overlay').textContent).toContain('<img src=x');
  expect(query('search-overlay').querySelector('img')).toBeNull(); expect(query('search-overlay').querySelector('[role="alert"]')).toBeNull();
  expect(query('search-example-grille')).not.toBeNull();
});

test('failure is not presented as zero results, exposes no internal diagnostic and retry recovers', async () => {
  Products.list.mockRejectedValueOnce(new Error('private stack and customer diagnostics')); await open(); await type('calandre'); await advance();
  expect(query('search-overlay').querySelector('[role="alert"]')).not.toBeNull();
  expect(query('search-overlay').textContent).toContain(fr.search.error_title); expect(query('search-overlay').textContent).not.toContain('private stack');
  expect(query('search-overlay').textContent).not.toContain('Aucun résultat'); await click(query('search-retry-button')); await advance();
  expect(query('search-result-link')).not.toBeNull(); expect(Products.list).toHaveBeenCalledTimes(2);
});

test('malformed catalogue responses also use the retry state instead of a white screen', async () => {
  Products.list.mockResolvedValue({ items: null }); await open(); await type('calandre'); await advance();
  expect(query('search-retry-button')).not.toBeNull();
});

test.each(['resolve', 'reject'])('obsolete %s cannot replace a newer search', async outcome => {
  const old = deferred(); Products.list.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ items: [{ ...part, id: 'new', name: 'Écran CarPlay', slug: 'carplay' }], total: 1 });
  await open(); await type('volant'); await advance(); await type('carplay'); await advance();
  await act(async () => { if (outcome === 'resolve') old.resolve({ items: [part], total: 1 }); else old.reject(new Error('old failure')); });
  expect(query('search-result-link').textContent).toContain('Écran CarPlay'); expect(query('search-retry-button')).toBeNull();
});

test('clear during an in-flight request returns to ideas and ignores the late response', async () => {
  const old = deferred(); Products.list.mockReturnValueOnce(old.promise); await open(); await type('calandre'); await advance();
  await click(query('search-clear-button')); await act(async () => old.resolve({ items: [part], total: 1 }));
  expect(query('search-overlay-input').value).toBe(''); expect(query('search-result-link')).toBeNull(); expect(query('search-example-grille')).not.toBeNull();
});

test('closing cancels queued state updates and reopening starts blank', async () => {
  const old = deferred(); Products.list.mockReturnValueOnce(old.promise); await open(); await type('calandre'); await advance();
  await click(query('search-overlay-close-button')); await act(async () => old.resolve({ items: [part], total: 1 })); await open();
  expect(query('search-overlay-input').value).toBe(''); expect(query('search-result-link')).toBeNull();
});

test('Enter and the all-results link preserve an encoded search term', async () => {
  const text = 'BMW F30 & calandre'; await open(); await type(text); await advance();
  expect(query('search-all-results-link').getAttribute('href')).toBe(searchCatalogueUrl(text));
  await act(async () => query('search-overlay').querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); await advance(0);
  expect(mockNavigate).toHaveBeenCalledWith('/shop?q=BMW+F30+%26+calandre'); expect(query('search-overlay')).toBeNull();
});

test('product navigation and missing/failed photos remain usable without broken-image text', async () => {
  Products.list.mockResolvedValue({ items: [part, { ...part, id: 'no-photo', slug: 'no-photo', images: [] }], total: 2 });
  await open(); await type('calandre'); await advance();
  await act(async () => query('search-result-link').querySelector('img').dispatchEvent(new Event('error')));
  const links = document.querySelectorAll('[data-testid="search-result-link"]'); expect(links).toHaveLength(2);
  expect(links[0].querySelector('img')).toBeNull(); expect(links[0].textContent).toContain(fr.search.photo_unavailable);
  expect(links[1].textContent).toContain(fr.search.photo_unavailable); await click(links[0]);
  expect(query('search-overlay')).toBeNull(); expect(document.activeElement).toBe(document.getElementById('ty-search-trigger'));
});

test('Escape releases the page, restores search focus and preserves an existing inline overflow', async () => {
  document.body.style.overflow = 'auto';
  try {
    await open(); await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))); await advance(0);
    expect(query('search-overlay')).toBeNull(); expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
    expect(document.activeElement).toBe(document.getElementById('ty-search-trigger')); expect(document.body.style.overflow).toBe('auto');
  } finally { document.body.style.overflow = ''; }
});

test('keyboard focus wraps inside the real dialog', async () => {
  await open(); const first = query('search-overlay-close-button'); const links = query('search-overlay').querySelectorAll('a'); const last = links[links.length - 1];
  await act(async () => { first.focus(); first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })); });
  expect(document.activeElement).toBe(last);
  await act(async () => last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })));
  expect(document.activeElement).toBe(first);
});

test('visual viewport resize keeps close/input above a simulated keyboard and cleans listeners', async () => {
  const listeners = new Map(); const visual = { height: 320, width: 300, offsetTop: 12, offsetLeft: 8, addEventListener: jest.fn((key, fn) => listeners.set(key, fn)), removeEventListener: jest.fn() };
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: visual }); await open();
  expect(query('search-overlay').style.height).toBe('320px'); expect(query('search-overlay').style.top).toBe('12px');
  expect(query('search-overlay').style.width).toBe('300px'); expect(query('search-overlay').style.left).toBe('8px');
  expect(query('search-overlay').classList.contains('search-sheet-compact')).toBe(true);
  await act(async () => { visual.height = 420; listeners.get('resize')(); });
  expect(query('search-overlay').style.height).toBe('420px'); await click(query('search-overlay-close-button'));
  expect(visual.removeEventListener).toHaveBeenCalledTimes(2);
});

test('a new query resets the internal results scroll without moving the background', async () => {
  await open(); await type('calandre'); await advance(); query('search-results-scroll').scrollTop = 90;
  await type('volant'); expect(query('search-results-scroll').scrollTop).toBe(0);
});

test('English labels are complete while examples still query the real French catalogue', async () => {
  mockLanguage = 'en'; await open(); expect(query('search-overlay').textContent).toContain(en.search.browse);
  expect(query('search-overlay-input').placeholder).toBe(en.search.placeholder);
  await click(query('search-example-grille')); await advance(); expect(Products.list).toHaveBeenCalledWith({ q: 'calandre', limit: 8 });
});

test('query bounds and URL construction retain Unicode and treat operators as plain encoded text', () => {
  expect(Array.from(normalizeSearchQuery(' 💎'.repeat(130))).length).toBe(120);
  const url = searchCatalogueUrl(' $regex & "BMW" '); expect(url.startsWith('/shop?')).toBe(true);
  expect(new URLSearchParams(url.split('?')[1]).get('q')).toBe('$regex & "BMW"'); expect(searchCatalogueUrl('  ')).toBe('/shop');
});

test('CSS reserves safe areas, bounds the scroll region, uses a legible input and disables motion when requested', () => {
  const css = fs.readFileSync(path.join(__dirname, 'SearchOverlay.css'), 'utf8');
  expect(css).toContain('height: 100dvh'); expect(css).toMatch(/\.search-scroll\s*\{[^}]*min-height: 0;[^}]*overflow-y: auto;/s);
  expect(css).toContain('font-size: max(16px, 1rem)'); expect(css).toContain('env(safe-area-inset-bottom, 0px)');
  expect(css).toContain('touch-action: pan-y'); expect(css).toContain('prefers-reduced-motion: reduce'); expect(css).toContain('animation: none');
});
