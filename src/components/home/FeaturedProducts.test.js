import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FeaturedProducts } from './FeaturedProducts';
import { PRODUCT_AUTOPLAY_DELAY } from './useProductAutoplay';
import { Products } from '@/lib/api';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';

const mockAdd = jest.fn();
jest.mock('@/lib/api', () => ({ Products: { list: jest.fn() } }));
jest.mock('@/contexts/AppContext', () => ({ useApp: () => ({ addToCart: mockAdd, toggleWishlist: jest.fn(), isInWishlist: () => false }) }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key.split('.').reduce((value, part) => value?.[part], require('@/lib/locales/fr.json')) ?? key, i18n: { language: 'fr' } }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), info: jest.fn(), error: jest.fn() } }));

const products = Array.from({ length: 8 }, (_, index) => ({
  id: `fixture-${index}`, slug: `part-${index}`, name: `Pièce ${index}`, price: 139 + index,
  currency: 'EUR', status: 'draft', stock: 0, test_purchase: true, images: [`/part-${index}.jpg`],
}));
let root, host, originalMedia, originalResizeObserver;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  originalMedia = window.matchMedia; originalResizeObserver = window.ResizeObserver;
  window.matchMedia = jest.fn(() => ({ matches: false }));
  delete window.ResizeObserver;
  jest.clearAllMocks();
  Products.list.mockResolvedValue({ items: products });
});
afterEach(() => {
  if (root) act(() => root.unmount());
  window.matchMedia = originalMedia; window.ResizeObserver = originalResizeObserver;
});
async function render() { await act(async () => root.render(<FeaturedProducts />)); }
function railWithOverflow() {
  const rail = host.querySelector('[data-testid="featured-products-rail"]');
  Object.defineProperties(rail, { clientWidth: { value: 360 }, scrollWidth: { value: 2400 } });
  Object.defineProperty(rail.children[0], 'offsetLeft', { value: 4 });
  Object.defineProperty(rail.children[1], 'offsetLeft', { value: 316 });
  rail.scrollBy = jest.fn(); rail.scrollTo = jest.fn();
  act(() => rail.dispatchEvent(new Event('scroll')));
  return rail;
}

test('keeps editorial selection first, with real card images, prices and product links', async () => {
  await render();
  expect(Products.list).toHaveBeenCalledTimes(1);
  expect(Products.list).toHaveBeenCalledWith({ featured: true, limit: 8 });
  const rail = host.querySelector('[data-testid="featured-products-rail"]');
  expect(rail.tagName).toBe('UL'); expect(rail.children).toHaveLength(8);
  expect(rail.querySelector('img').getAttribute('src')).toBe('/part-0.jpg');
  expect(rail.querySelector('[data-testid="product-card"]').getAttribute('href')).toBe('/product/part-0');
  expect(rail.querySelector('[data-testid="product-card-price"]').textContent).toContain('139');
  expect(host.textContent).toContain(fr.featured.sub);
  expect(host.textContent).toContain('Disponible pour les tests');
  expect(host.querySelector('[data-testid="featured-view-all-button"]').getAttribute('href')).toBe('/shop');
});

test('falls back to catalogue only when featured is empty, never inventing references or changing flags', async () => {
  Products.list.mockResolvedValueOnce({ items: [] }).mockResolvedValueOnce({ items: products });
  await render();
  expect(Products.list.mock.calls).toEqual([[{ featured: true, limit: 8 }], [{ limit: 8 }]]);
  expect(host.querySelectorAll('[data-testid="product-card"]')).toHaveLength(8);
  expect(host.textContent).toContain(fr.featured.catalogue_sub);
  await act(async () => host.querySelector('[data-testid="product-card-add-to-cart-button"]').click());
  expect(mockAdd).toHaveBeenCalledWith('fixture-0', 1);
});

test('loading has a reserved rail and an accessible status instead of a blank gap', async () => {
  Products.list.mockReturnValue(new Promise(() => {}));
  await render();
  expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
  expect(host.querySelector('[role="status"]').textContent).toBe(fr.featured.loading);
  expect(host.querySelectorAll('.featured-product-skeleton')).toHaveLength(4);
  expect(host.querySelector('[data-testid="featured-next-button"]')).toBeNull();
});

test.each(['initial', 'fallback'])('a failed %s request is explicit and retry recovers', async kind => {
  if (kind === 'fallback') Products.list.mockResolvedValueOnce({ items: [] });
  Products.list.mockRejectedValueOnce(new Error('private diagnostic must not be exposed'));
  await render();
  expect(host.querySelector('[role="alert"]').textContent).toBe(fr.featured.error);
  expect(host.textContent).not.toContain('private diagnostic');
  await act(async () => host.querySelector('[data-testid="featured-retry-button"]').click());
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelectorAll('[data-testid="product-card"]')).toHaveLength(8);
});

test('a malformed API response is an error, not an empty catalogue', async () => {
  Products.list.mockResolvedValueOnce({ total: 8 });
  await render();
  expect(host.querySelector('[role="alert"]').textContent).toBe(fr.featured.error);
  expect(Products.list).toHaveBeenCalledTimes(1);
});

test('a truly empty catalogue has an honest status with the catalogue link still available', async () => {
  Products.list.mockResolvedValue({ items: [] });
  await render();
  expect(host.querySelector('[role="status"]').textContent).toBe(fr.featured.empty);
  expect(host.querySelector('[data-testid="featured-products-rail"]')).toBeNull();
  expect(host.querySelector('[data-testid="featured-view-all-button"]')).not.toBeNull();
});

test('an unmounted request never starts a late fallback', async () => {
  let resolve;
  Products.list.mockReturnValue(new Promise(done => { resolve = done; }));
  await render();
  act(() => root.unmount()); root = null;
  await act(async () => resolve({ items: [] }));
  expect(Products.list).toHaveBeenCalledTimes(1);
});

test('arrows scroll one card, update disabled boundaries and respect reduced motion', async () => {
  await render();
  const rail = railWithOverflow();
  const previous = host.querySelector('[data-testid="featured-previous-button"]');
  const next = host.querySelector('[data-testid="featured-next-button"]');
  expect(previous.disabled).toBe(true); expect(next.disabled).toBe(false);
  expect(next.getAttribute('aria-controls')).toBe(rail.id);
  act(() => next.click());
  expect(rail.scrollBy).toHaveBeenLastCalledWith({ left: 312, behavior: 'smooth' });
  rail.scrollLeft = 2040;
  act(() => rail.dispatchEvent(new Event('scroll')));
  expect(previous.disabled).toBe(false); expect(next.disabled).toBe(true);
  window.matchMedia.mockReturnValue({ matches: true });
  act(() => previous.click());
  expect(rail.scrollBy).toHaveBeenLastCalledWith({ left: -312, behavior: 'auto' });
});

test('keyboard navigates the focused rail without stealing keys from product controls', async () => {
  await render();
  const rail = railWithOverflow();
  expect(rail.tabIndex).toBe(0);
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    act(() => rail.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
  }
  expect(rail.scrollTo.mock.calls).toEqual([[{ left: 0, behavior: 'smooth' }], [{ left: 2400, behavior: 'smooth' }]]);
  rail.scrollBy.mockClear();
  const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
  act(() => rail.querySelector('a').dispatchEvent(event));
  expect(event.defaultPrevented).toBe(false); expect(rail.scrollBy).not.toHaveBeenCalled();
});

test('resize observer is cleaned up and recalculates scrolling after a responsive change', async () => {
  let observeResize;
  const observe = jest.fn(), disconnect = jest.fn();
  window.ResizeObserver = class { constructor(callback) { observeResize = callback; } observe(...args) { observe(...args); } disconnect() { disconnect(); } };
  await render();
  const rail = railWithOverflow();
  expect(observe).toHaveBeenCalledWith(rail);
  rail.scrollLeft = 2040; act(() => observeResize());
  expect(host.querySelector('[data-testid="featured-next-button"]').disabled).toBe(true);
  act(() => root.unmount()); root = null;
  expect(disconnect).toHaveBeenCalledTimes(1);
});

test('new carousel copy is available in both supported languages', () => {
  expect(Object.keys(fr.featured)).toEqual(Object.keys(en.featured));
  expect(Object.values(en.featured).every(value => typeof value === 'string' && value.length > 0)).toBe(true);
});

describe('automatic horizontal scrolling', () => {
  let viewportChange, mediaChange, media, observer, originalObserver, hiddenDescriptor, hidden, boundsVisible;
  beforeEach(() => {
    jest.useFakeTimers();
    originalObserver = window.IntersectionObserver;
    hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
    hidden = false;
    boundsVisible = false;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    observer = { observe: jest.fn(), disconnect: jest.fn() };
    window.IntersectionObserver = class { constructor(callback) { viewportChange = callback; } observe(...args) { observer.observe(...args); } disconnect() { observer.disconnect(); } };
    media = { matches: false, addEventListener: jest.fn((type, callback) => { mediaChange = callback; }), removeEventListener: jest.fn() };
    window.matchMedia.mockImplementation(() => media);
  });
  afterEach(() => {
    if (root) act(() => root.unmount()); root = null;
    window.IntersectionObserver = originalObserver;
    if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor);
    else delete document.hidden;
    jest.useRealTimers();
  });
  function view(visible) { boundsVisible = visible; act(() => viewportChange([{ isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }])); }
  function autoplayRail() {
    const rail = railWithOverflow();
    rail.getBoundingClientRect = () => ({ left: 20, right: 380, top: boundsVisible ? 100 : 2000, bottom: boundsVisible ? 300 : 2200, width: 360, height: 200 });
    return rail;
  }
  function tick() { act(() => jest.advanceTimersByTime(PRODUCT_AUTOPLAY_DELAY)); }
  function pointer(type, pointerType) {
    const event = new MouseEvent(type, { bubbles: true, relatedTarget: null });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    act(() => host.querySelector('[data-testid="featured-autoplay-surface"]').dispatchEvent(event));
  }

  test('moves one card automatically only in view, and loops back at the end', async () => {
    await render(); const rail = autoplayRail();
    expect(observer.observe).toHaveBeenCalledWith(rail);
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    view(true);
    act(() => jest.advanceTimersByTime(PRODUCT_AUTOPLAY_DELAY - 1));
    expect(rail.scrollBy).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(rail.scrollBy).toHaveBeenLastCalledWith({ left: 312, behavior: 'smooth' });
    rail.scrollLeft = 2040; tick();
    expect(rail.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
    view(false); rail.scrollBy.mockClear(); tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    expect(host.querySelectorAll('[data-testid="product-card"]')).toHaveLength(8);
  });

  test('pause is persistent until explicit resume and the button remains accessible', async () => {
    await render(); const rail = autoplayRail(); view(true);
    const button = host.querySelector('[data-testid="featured-autoplay-button"]');
    expect(button.getAttribute('aria-label')).toBe(fr.featured.pause);
    expect(button.getAttribute('aria-controls')).toBe(rail.id);
    act(() => button.click());
    expect(button.getAttribute('aria-label')).toBe(fr.featured.play);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    act(() => button.click()); tick(); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  test('mouse hover pauses but a touch pointer entering does not create sticky hover', async () => {
    await render(); const rail = autoplayRail(); view(true);
    pointer('pointerover', 'mouse'); tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    expect(rail.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' });
    pointer('pointerout', 'mouse'); tick(); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
    rail.scrollBy.mockClear(); pointer('pointerover', 'touch'); tick(); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  test('swiping/touching pauses and pointer cancel safely resumes after a fresh delay', async () => {
    await render(); const rail = autoplayRail(); view(true);
    pointer('pointerdown', 'touch'); tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    pointer('pointercancel', 'touch'); tick(); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  test('keyboard focus pauses while product controls are being read or used', async () => {
    await render(); const rail = autoplayRail(); view(true);
    act(() => rail.querySelector('a').dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    act(() => rail.querySelector('a').dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })));
    tick(); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  test('hidden tabs stop rotation and resume with no catch-up when visible', async () => {
    await render(); const rail = autoplayRail(); view(true);
    hidden = true; act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => jest.advanceTimersByTime(60000)); expect(rail.scrollBy).not.toHaveBeenCalled();
    hidden = false; act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => jest.advanceTimersByTime(PRODUCT_AUTOPLAY_DELAY - 1)); expect(rail.scrollBy).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1)); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
  });

  test('reduced motion disables rotation and its autoplay control, including preference changes', async () => {
    media.matches = true;
    await render(); const rail = autoplayRail(); view(true);
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    expect(host.querySelector('[data-testid="featured-autoplay-button"]')).toBeNull();
    media.matches = false; act(() => mediaChange());
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
    act(() => host.querySelector('[data-testid="featured-autoplay-button"]').click()); tick();
    expect(rail.scrollBy).toHaveBeenCalledTimes(1);
    media.matches = true; act(() => mediaChange()); rail.scrollBy.mockClear();
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
  });

  test('manual navigation resets the delay and unmount removes timer, observer and preference listener', async () => {
    await render(); const rail = autoplayRail(); view(true);
    act(() => jest.advanceTimersByTime(4000));
    act(() => host.querySelector('[data-testid="featured-next-button"]').click());
    rail.scrollBy.mockClear();
    act(() => jest.advanceTimersByTime(500)); expect(rail.scrollBy).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(4000)); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
    act(() => root.unmount()); root = null;
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(media.removeEventListener).toHaveBeenCalledWith('change', mediaChange);
    expect(jest.getTimerCount()).toBe(0);
  });

  test('stale visibility notification cannot keep a physically visible rail frozen', async () => {
    await render(); const rail = autoplayRail();
    boundsVisible = true; // No observer notification after a pinned-layout jump.
    tick(); expect(rail.scrollBy).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[data-testid="featured-autoplay-surface"]').getAttribute('data-autoplay-state')).toBe('running');
    boundsVisible = false; rail.scrollBy.mockClear();
    tick(); expect(rail.scrollBy).not.toHaveBeenCalled();
  });
});
