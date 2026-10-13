/* eslint-env node */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CommunitySection } from './CommunitySection';
import { CategoriesSection } from './CategoriesSection';
import { HeroSection } from './HeroSection';
import BrandDetail from '@/pages/BrandDetail';
import CategoryPage from '@/pages/CategoryPage';
import { categoryEditorialImage, EDITORIAL_IMAGES, editorialImageProps } from '@/lib/editorialImages';
import { Categories, Brands, Products } from '@/lib/api';
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
  window.matchMedia = jest.fn(() => ({ matches: true }));
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
});

test('Hero photo space is mobile-only and Pexels is narrowly permitted as an image host', () => {
  const css = fs.readFileSync(path.join(__dirname, 'HeroSection.css'), 'utf8');
  expect(css).toContain('@media (max-width: 767px)');
  expect(css).toContain('object-position: 50% 76%');
  expect(css).toContain('.hero-mobile-photo');
  expect(css).toContain('margin-top: 1.5rem');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../vercel.json'), 'utf8'));
  const csp = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  expect(csp).toContain("img-src 'self' data: https://images.unsplash.com https://res.cloudinary.com https://images.pexels.com;");
  expect(csp).toContain("script-src 'self';");
  expect(csp).not.toContain('img-src *');
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
