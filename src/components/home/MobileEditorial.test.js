/* eslint-env node */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CommunitySection } from './CommunitySection';
import { CategoriesSection } from './CategoriesSection';
import { HeroSection } from './HeroSection';
import { StorytellingSection } from './StorytellingSection';
import BrandDetail from '@/pages/BrandDetail';
import CategoryPage from '@/pages/CategoryPage';
import { categoryEditorialImage, EDITORIAL_IMAGES, editorialImageProps } from '@/lib/editorialImages';
import { Categories, Brands, Products } from '@/lib/api';
import { responsiveImageProps } from '@/lib/image';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';
import fs from 'fs';
import path from 'path';

jest.mock('@/lib/api', () => ({ Categories: { list: jest.fn(), get: jest.fn() }, Brands: { get: jest.fn() }, Products: { list: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ slug: 'technology' }), Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key.split('.').reduce((value, part) => value?.[part], require('@/lib/locales/fr.json')) ?? key }) }));
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
  expect([...host.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(['/category/performance', '/category/interior', '/category/technology']);
  expect([...host.querySelectorAll('img')].every(image => image.src.includes('images.pexels.com'))).toBe(true);
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
  expect(host.querySelectorAll('a[rel="noopener noreferrer"]')).toHaveLength(3);
});
test('a failed inspiration image has a readable fallback instead of a broken image', () => {
  act(() => root.render(<CommunitySection />));
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('[role="status"]').textContent).toContain('Subaru');
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
  expect(fr.categories.title).toBe('Performance. Intérieur. Technologie.');
});
