/* eslint-env node */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CommunitySection } from './CommunitySection';
import { CategoriesSection } from './CategoriesSection';
import { HeroSection } from './HeroSection';
import { StorytellingSection } from './StorytellingSection';
import { BrandsSection } from './BrandsSection';
import { CtaSection } from './CtaSection';
import { HomeEditorialPhoto, HomePhotoCredits } from './HomeEditorialPhoto';
import { HOME_PHOTOS, HOME_CATEGORY_PHOTOS, HOME_BRAND_PHOTOS } from '@/lib/homeEditorialPhotos';
import BrandDetail from '@/pages/BrandDetail';
import CategoryPage from '@/pages/CategoryPage';
import { categoryEditorialImage, EDITORIAL_IMAGES, editorialImageProps } from '@/lib/editorialImages';
import { Categories, Brands, Products } from '@/lib/api';
import { responsiveImageProps } from '@/lib/image';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';
import fs from 'fs';
import path from 'path';

jest.mock('@/lib/api', () => ({ Categories: { list: jest.fn(), get: jest.fn() }, Brands: { get: jest.fn(), list: jest.fn() }, Products: { list: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ slug: 'technology' }), Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options = {}) => {
  const value = key.split('.').reduce((item, part) => item?.[part], require('@/lib/locales/fr.json')) ?? key;
  return typeof value === 'string' ? value.replace(/{{(\w+)}}/g, (_, name) => options[name] ?? '') : value;
} }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('@/components/shared/ProductCard', () => ({ ProductCard: () => null }));
let root, host, originalMedia, originalObserver;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  originalMedia = window.matchMedia; originalObserver = window.IntersectionObserver;
  window.matchMedia = jest.fn(() => ({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  delete window.IntersectionObserver;
  Products.list.mockResolvedValue({ items: [] });
});
afterEach(() => { act(() => root.unmount()); window.matchMedia = originalMedia; window.IntersectionObserver = originalObserver; jest.clearAllMocks(); });

test('all category aliases use relevant editorial photos, not product images', () => {
  expect(categoryEditorialImage('exterior')).toBe(EDITORIAL_IMAGES.performance);
  expect(categoryEditorialImage('multimedia-technology')).toBe(EDITORIAL_IMAGES.technology);
  expect(categoryEditorialImage('interior')).toBe(EDITORIAL_IMAGES.interior);
  expect(categoryEditorialImage('unknown')).toBeNull();
  const props = editorialImageProps(EDITORIAL_IMAGES.detail, '50vw');
  expect(props.srcSet).toContain('1400w'); expect(props.sizes).toBe('50vw');
  expect(new URL(props.src).searchParams.get('w')).toBe('960');
});
test('home categories retain backend routes but replace the unrelated category photos', async () => {
  Categories.list.mockResolvedValue(['exterior', 'interior', 'multimedia-technology'].map(slug => ({ slug, image: '/unrelated-car.jpg' })));
  await act(async () => root.render(<CategoriesSection />));
  expect(host.querySelectorAll('img')).toHaveLength(3);
  expect(host.textContent).toContain('Performance. Intérieur. Technologie.');
  expect([...host.querySelectorAll('[data-testid="category-card"]')].map(link => link.getAttribute('href'))).toEqual(['/category/performance', '/category/interior', '/category/technology']);
  expect([...host.querySelectorAll('img')].map(image => image.getAttribute('src'))).toEqual(Object.values(HOME_CATEGORY_PHOTOS).map(photo => photo.src));
  expect(host.textContent).toContain('ne montrent pas les références exactes');
  expect(host.querySelectorAll('.home-photo-credits li')).toHaveLength(3);
});
test('Hero keeps the selected photo, original animations and catalogue CTA', () => {
  act(() => root.render(<HeroSection />));
  expect(host.querySelector('img').src).toContain('photo-1762314907955-b7c1e11a8782');
  expect(host.querySelector('.hero-photo-frame')).not.toBeNull();
  expect(host.querySelector('.ty-hero-rise')).not.toBeNull();
  expect(host.querySelector('a').getAttribute('href')).toBe('/shop');
  expect(host.querySelector('a').textContent).toBe('Explorer la collection');
  expect(host.querySelector('a').className).toBe('hero-primary-cta');
  expect(host.querySelector('a svg').getAttribute('aria-hidden')).toBe('true');
});

test('storytelling has phone-only portrait sources and leaves the introduction outside the scene', () => {
  act(() => root.render(<StorytellingSection />));
  const viewport = host.querySelector('.storytelling-viewport');
  expect(viewport.querySelector('.storytelling-header')).toBeNull();
  expect(host.querySelectorAll('.storytelling-card img')).toHaveLength(6);
  const sources = [...host.querySelectorAll('picture source')];
  expect(sources).toHaveLength(2);
  expect(sources.every(source => source.media === '(max-width: 767px)' && source.sizes === '100vw')).toBe(true);
  expect(sources[0].srcset).toContain('/11836461/');
  expect(sources[1].srcset).toContain('/12170112/');
  expect(host.querySelector('.storytelling-image-2 img').src).toContain('photo-1773709766452-8f96b950bf8f');
  expect(host.querySelector('.storytelling-image-6 img').src).toContain('photo-1747595558629-6a73f97b62d6');
});

test('Hero photo space is mobile-only and Pexels is narrowly permitted as an image host', () => {
  const css = fs.readFileSync(path.join(__dirname, 'HeroSection.css'), 'utf8');
  expect(css).toContain('@media (max-width: 767px)');
  expect(css).toContain('object-position: 50% 76%');
  expect(css).toContain('.hero-mobile-photo');
  expect(css).toContain('min-height: 100svh');
  expect(css).toContain('--hero-photo-height: min(50vw, 24svh)');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../vercel.json'), 'utf8'));
  const csp = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  expect(csp).toContain("img-src 'self' data: https://images.unsplash.com https://res.cloudinary.com https://images.pexels.com;");
  expect(csp).toContain("script-src 'self';");
  expect(csp).not.toContain('img-src *');
});

test('phone Hero uses available height without clipping enlarged text or altering desktop motion', () => {
  act(() => root.render(<HeroSection />));
  const content = host.querySelector('.hero-content');
  expect(content.className).toContain('pt-32 pb-20 min-h-[100svh]');
  expect(content.querySelector('.hero-description').textContent).toBe(fr.hero.sub);
  expect(content.querySelector('.hero-actions a').textContent).toContain(fr.hero.cta_primary);
  expect(content.querySelectorAll('[data-testid="hero-spec-strip"] p')).toHaveLength(3);
  expect(content.querySelector('.hero-mobile-photo img').src).toContain('photo-1762314907955-b7c1e11a8782');
  const css = fs.readFileSync(path.join(__dirname, 'HeroSection.css'), 'utf8');
  expect(css).toContain('(max-height: 700px)');
  expect(css).toContain('env(safe-area-inset-bottom, 0px)');
  expect(css).not.toMatch(/(?:^|[;{]\s*)height:\s*100(?:s|d)?vh/m);
  expect(css).not.toContain('text-overflow: ellipsis');
  expect(host.querySelectorAll('.ty-hero-rise')).toHaveLength(4);
});

test('phone Hero aligns its intro under navigation and spends spare height around the photo, not above it', () => {
  const css = fs.readFileSync(path.join(__dirname, 'HeroSection.css'), 'utf8');
  expect(css).toContain('justify-content: flex-start');
  expect(css.match(/\.hero-content\s*\{[^}]*\}/g).every(rule => !rule.includes('justify-content: center'))).toBe(true);
  expect(css).toContain('padding-top: 5rem');
  expect(css).toContain('flex: 1 0 auto');
  expect(css.match(/height: var\(--hero-photo-height\)/g)).toHaveLength(2);
  act(() => root.render(<HeroSection />));
  const strip = host.querySelector('[data-testid="hero-spec-strip"]');
  expect(strip.className).not.toContain('absolute');
  expect(strip.previousElementSibling.className).toBe('hero-mobile-photo');
  expect(host.querySelectorAll('.hero-corner-accent[aria-hidden="true"]')).toHaveLength(2);
});

test('phone Hero keeps desktop glow layers hidden without changing photo sources, geometry rules or motion', () => {
  act(() => root.render(<HeroSection />));
  const expected = responsiveImageProps('https://images.unsplash.com/photo-1762314907955-b7c1e11a8782?auto=format&fit=crop&w=2200&q=88', [640, 960, 1440], '100vw', 76);
  const images = [...host.querySelectorAll('.hero-photo-frame img, .hero-mobile-photo img')];
  expect(images).toHaveLength(2);
  images.forEach(image => Object.entries(expected).forEach(([key, value]) => expect(image.getAttribute(key)).toBe(value)));
  expect(host.querySelector('.hero-mobile-photo').className).toBe('hero-mobile-photo');
  expect(host.querySelector('.hero-photo-frame').className).toBe('hero-photo-frame absolute inset-0 scale-[1.04]');
  expect(host.querySelector('.hero-side-glow').getAttribute('aria-hidden')).toBe('true');
  const css = fs.readFileSync(path.join(__dirname, 'HeroSection.css'), 'utf8');
  const phoneRules = css.slice(css.indexOf('@media (max-width: 767px) {'), css.indexOf('@media (max-width: 767px) and'));
  expect(phoneRules).toMatch(/\.hero-side-glow,[\s\S]*?\.hero-side-scrim,[\s\S]*?\.hero-floor-scrim\s*\{\s*display:\s*none/);
  expect(phoneRules).not.toMatch(/background:\s*linear-gradient|filter:|transform:|opacity:/);
  expect(css).toMatch(/\.hero-primary-cta\s*\{[^}]*box-shadow:\s*none;/);
  expect(host.querySelector('a').classList.contains('ty-btn-primary')).toBe(false);
  expect(phoneRules).toContain('object-position: 50% 76%');
  expect(phoneRules).toContain('mask-image: linear-gradient(transparent, #000 12%, #000 85%, transparent)');
  expect(phoneRules.match(/height: var\(--hero-photo-height\)/g)).toHaveLength(2);
  expect(host.querySelectorAll('.ty-hero-rise')).toHaveLength(4);
});

test('phone Hero has only one faint theme gradient on its background, never on the photo', () => {
  const css = fs.readFileSync(path.join(__dirname, 'HeroSection.css'), 'utf8');
  const phoneRules = css.slice(css.indexOf('@media (max-width: 767px) {'), css.indexOf('@media (max-width: 767px) and'));
  const background = phoneRules.match(/\[data-testid="hero-section"\]\s*\{([^}]+)\}/)?.[1];
  expect(background).toBeDefined();
  expect(background).toContain('background-image: radial-gradient(');
  expect(background.match(/(?:radial|linear)-gradient\(/g)).toHaveLength(1);
  expect(background).toContain('ellipse 115% 58% at 100% 18%');
  expect(background).toContain('rgba(225, 6, 0, 0.12) 0%');
  expect(background).toContain('rgba(118, 18, 24, 0.06) 42%');
  expect(background).toContain('rgba(5, 6, 8, 0) 72%');
  expect(background).toContain('background-repeat: no-repeat');
  expect(background).not.toMatch(/(?:^|[;{]\s*)(?:position|display|height|width|margin|padding|transform|filter|opacity|border)\s*:/m);
  expect(phoneRules.match(/background-image:\s*(?:radial|linear)-gradient/g)).toHaveLength(1);
  const photoRules = phoneRules.match(/\.hero-mobile-photo > img\s*\{([^}]+)\}/)?.[1];
  expect(photoRules).not.toMatch(/background|filter|opacity|transform/);
});
test('inspiration is default-visible without animation APIs, with useful links and honest attribution', () => {
  act(() => root.render(<CommunitySection />));
  expect(host.querySelectorAll('[data-testid="community-card"]')).toHaveLength(3);
  expect(host.textContent).toContain('ne sont pas des réalisations TYMotors');
  expect(host.querySelector('[data-testid="community-customize-cta"]').getAttribute('href')).toBe('/customize');
  expect(host.querySelectorAll('img[loading="lazy"]')).toHaveLength(3);
  expect(host.querySelectorAll('a[rel="noopener noreferrer"]')).toHaveLength(6);
  expect([...host.querySelectorAll('img')].every(image => image.getAttribute('src').startsWith('/images/home/'))).toBe(true);
});
test('a failed inspiration image has a readable fallback instead of a broken image', () => {
  act(() => root.render(<CommunitySection />));
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('[role="status"]').textContent).toContain(fr.home_photos.alts.mercedes);
  expect(host.querySelectorAll('img')).toHaveLength(2);
});
test('reduced motion disconnects the observer, leaves content visible, and cleans up on unmount', () => {
  let callback;
  const disconnect = jest.fn();
  window.IntersectionObserver = class { constructor(fn) { callback = fn; } observe() {} disconnect() { disconnect(); } };
  act(() => root.render(<CommunitySection />));
  act(() => callback([{ isIntersecting: true }]));
  expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(host.querySelector('.universe-card').style.opacity).toBe('');
});
test.each([['brand', BrandDetail], ['category', CategoryPage]])('%s banner content stays in document flow on phones, absolute only on desktop', async (kind, Component) => {
  const item = { name: 'Multimédia et technologie', image: '/old.jpg', description: 'Une description suffisamment longue pour passer sur plusieurs lignes.' };
  Brands.get.mockResolvedValue(item); Categories.get.mockResolvedValue(item);
  await act(async () => root.render(<Component />));
  const content = host.querySelector('[data-testid="catalog-hero-content"]');
  expect(content.className).toContain('relative lg:absolute');
  expect(host.querySelector('main').className).toContain('pt-16 lg:pt-20');
  expect(host.querySelector('[data-testid="catalog-hero"]').className).not.toContain('aspect-[16/');
});
test('French and English new editorial copy have matching complete keys', () => {
  const keys = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) => typeof item === 'object' ? keys(item, `${prefix}${key}.`) : [`${prefix}${key}`]);
  expect(keys(fr.community)).toEqual(keys(en.community));
  expect(keys(fr.home_photos)).toEqual(keys(en.home_photos));
  expect(fr.categories.title).toBe('Performance. Intérieur. Technologie.');
});

test('home brand cards keep their photographic design and backend routes, but use the licensed local photos', async () => {
  const brands = ['bmw', 'mercedes-benz', 'audi', 'porsche', 'volkswagen', 'toyota'].map(slug => ({ slug, name: slug === 'volkswagen' ? 'Volkswagen' : slug, tagline: 'Équipements compatibles', image: `https://images.unsplash.com/photo-${slug}` }));
  Brands.list.mockResolvedValue(brands);
  await act(async () => root.render(<BrandsSection />));
  expect(host.querySelectorAll('img')).toHaveLength(6);
  expect([...host.querySelectorAll('img')].map(image => image.getAttribute('src'))).toEqual(brands.map(brand => HOME_BRAND_PHOTOS[brand.slug].src));
  expect(host.querySelectorAll('.home-photo-credits li')).toHaveLength(6);
  expect([...host.querySelectorAll('img')].every(image => image.getAttribute('loading') === 'lazy' && image.className.includes('object-cover'))).toBe(true);
  expect([...host.querySelectorAll('[data-testid="brand-card"]')].map(link => link.getAttribute('href'))).toEqual(brands.map(brand => `/brands/${brand.slug}`));
  expect(host.textContent).toContain('Volkswagen');
  const css = fs.readFileSync(path.join(__dirname, 'HomeEditorial.css'), 'utf8');
  expect(css).not.toContain('.home-brand-card::before');
  expect(css).toContain('.home-brand-grid > * { min-width: 0; }');
  expect(css).toContain('box-sizing: border-box; padding: .75rem;');
});

test('a missing or failed brand image leaves its real name and navigation accessible', async () => {
  Brands.list.mockResolvedValue([{ slug: 'bmw', name: 'BMW', image: '/broken.jpg' }, { slug: 'other', name: 'Other' }]);
  await act(async () => root.render(<BrandsSection />));
  expect(host.querySelectorAll('img')).toHaveLength(1);
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('img').hidden).toBe(true);
  expect(host.querySelector('h3').textContent).toBe('BMW');
  expect(host.querySelector('[data-testid="brand-card"]').getAttribute('href')).toBe('/brands/bmw');
});

test('final CTA is graphic-only and still opens the catalogue with its premium button', () => {
  act(() => root.render(<CtaSection />));
  expect(host.querySelectorAll('img')).toHaveLength(0);
  const cta = host.querySelector('[data-testid="prefooter-cta-button"]');
  expect(cta.getAttribute('href')).toBe('/shop');
  expect(cta.className).toContain('ty-btn-primary');
  expect(host.querySelector('.home-collection-cta-art').getAttribute('aria-hidden')).toBe('true');
});

test('editorial photo errors never prevent navigation and a changed source resets the error', () => {
  act(() => root.render(<HomeEditorialPhoto photo={HOME_PHOTOS.bmw} />));
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('img')).toBeNull();
  expect(host.querySelector('[role="status"]').textContent).toContain(fr.home_photos.unavailable);
  act(() => root.render(<HomeEditorialPhoto photo={HOME_PHOTOS.cockpit} />));
  expect(host.querySelector('[role="status"]')).toBeNull();
  expect(host.querySelector('img').getAttribute('src')).toBe(HOME_PHOTOS.cockpit.src);
});

test('photo credits deduplicate images, retain authors/titles and link to each licence', () => {
  act(() => root.render(<HomePhotoCredits photos={[HOME_PHOTOS.cockpit, HOME_PHOTOS.cockpit, HOME_PHOTOS.mercedes]} />));
  expect(host.querySelectorAll('li')).toHaveLength(2);
  expect(host.textContent).toContain('Vauxford');
  expect(host.textContent).toContain(HOME_PHOTOS.cockpit.title);
  expect(host.textContent).toContain('Mr.choppers');
  expect(host.querySelector(`a[href="${HOME_PHOTOS.cockpit.licenceUrl}"]`)).not.toBeNull();
});

test('published homepage photos exist locally and have a provenance record, without changing the shared storytelling map', () => {
  for (const photo of Object.values(HOME_PHOTOS)) {
    expect(fs.existsSync(path.join(__dirname, '../../../public', photo.src))).toBe(true);
    expect(photo.width).toBeGreaterThanOrEqual(1023);
    expect(photo.height).toBeGreaterThan(0);
    expect(photo.source).toMatch(/^https:\/\/(?:www\.flickr\.com\/photos\/|www\.motor\.es\/|commons\.wikimedia\.org\/wiki\/File:)/);
    expect(photo.source).not.toMatch(/unsplash|pexels/i);
    expect(photo.licenceUrl).toMatch(/^https:\/\/creativecommons\.org\//);
  }
  const credits = fs.readFileSync(path.join(__dirname, '../../../public/images/home/CREDITS.md'), 'utf8');
  expect(credits).toContain('CC BY-SA 2.0');
  expect(credits).toContain('CC BY-SA 3.0');
  expect(credits).toContain('CC BY-SA 4.0');
  for (const photo of Object.values(HOME_PHOTOS)) {
    expect(credits).toContain(photo.src.split('/').pop());
    expect(credits).toContain(require('crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../../../public', photo.src))).digest('hex'));
  }
});

test('approved replacements exclude CONCAVO and preserve the exact Porsche and Technology image bytes', () => {
  const replacements = {
    bmw: 'bmw-m4cs-vr46', mercedes: 'mercedes-amg-gtr-grey', audi: 'audi-rs6-c8',
    volkswagen: 'volkswagen-golf-r-black', toyota: 'toyota-gr-supra-black',
    cockpit: 'interior-audi-rs6', detail: 'detail-amg-gtr-wheel',
  };
  for (const [key, file] of Object.entries(replacements)) {
    expect(HOME_PHOTOS[key].src).toBe(`/images/home/${file}.jpg`);
    expect(JSON.stringify(HOME_PHOTOS[key])).not.toMatch(/concavo|unsplash|pexels/i);
    expect(fr.home_photos.alts[key]).not.toMatch(/concavo/i);
    expect(en.home_photos.alts[key]).not.toMatch(/concavo/i);
  }
  const preserved = {
    porsche: ['porsche-manthey', '1d32bd08e5eea412833f424f219aca5b687bd3740f6918a4142708e5b9e8ad62'],
    technology: ['technology-bmw-g81', '399d0278a8164ac4c373c68780ef5d2715fb956b6228121018b21b70fbf97137'],
  };
  for (const [key, [file, hash]] of Object.entries(preserved)) {
    expect(HOME_PHOTOS[key].src).toBe(`/images/home/${file}.jpg`);
    expect(require('crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../../../public', HOME_PHOTOS[key].src))).digest('hex')).toBe(hash);
  }
});

test('mobile inspiration selection enlarges only one card, toggles off, and never changes CTA destinations', () => {
  act(() => root.render(<CommunitySection />));
  const cards = [...host.querySelectorAll('[data-testid="community-card"]')];
  expect(host.querySelector('.universe-grid').hasAttribute('data-lenis-prevent')).toBe(true);
  expect(host.querySelector('.universe-grid').tabIndex).toBe(0);
  const buttons = [...host.querySelectorAll('.universe-select')];
  cards.forEach(card => { card.scrollIntoView = jest.fn(); });
  const destinations = cards.map(card => card.querySelector('a').getAttribute('href'));
  expect(buttons.every(button => button.type === 'button' && button.getAttribute('aria-pressed') === 'false')).toBe(true);
  act(() => buttons[0].click());
  expect(cards[0].classList.contains('is-selected')).toBe(true);
  expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
  expect(buttons[0].getAttribute('aria-label')).toContain('Réduire');
  expect(cards[0].scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'center', behavior: 'auto' });
  window.matchMedia = jest.fn(() => ({ matches: false }));
  act(() => buttons[1].click());
  expect(cards[1].scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  expect(host.querySelectorAll('.is-selected')).toHaveLength(1);
  expect(cards[1].classList.contains('is-selected')).toBe(true);
  act(() => buttons[1].click());
  expect(host.querySelectorAll('.is-selected')).toHaveLength(0);
  expect(cards.map(card => card.querySelector('a').getAttribute('href'))).toEqual(destinations);
});

test('mobile inspiration has a native horizontal rail, compact cards, focus and reduced-motion support; desktop keeps its grid', () => {
  const css = fs.readFileSync(path.join(__dirname, 'CommunitySection.css'), 'utf8');
  const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));
  expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
  expect(mobile).toContain('overflow-x: auto');
  expect(mobile).toContain('scroll-snap-type: x proximity');
  expect(mobile).toContain('flex: 0 0 min(78vw, 19rem)');
  expect(mobile).toContain('transform: scale(1.035)');
  expect(mobile).toContain('.universe-select:focus-visible');
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  expect(css).toContain('.universe-card { transition: none; }');
});
