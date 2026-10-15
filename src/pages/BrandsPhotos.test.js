import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams } from 'react-router-dom';
import BrandsIndex from './BrandsIndex';
import BrandDetail from './BrandDetail';
import { Brands, Products } from '@/lib/api';
import { HOME_BRAND_PHOTOS } from '@/lib/homeEditorialPhotos';
import fr from '@/lib/locales/fr.json';

jest.mock('@/lib/api', () => ({ Brands: { list: jest.fn(), get: jest.fn() }, Products: { list: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: jest.fn(), Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key.split('.').reduce((item, part) => item?.[part], require('@/lib/locales/fr.json')) ?? key }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('@/components/shared/ProductCard', () => ({ ProductCard: ({ product }) => <div data-testid="product-photo"><img src={product.images[0]} alt={product.name} /></div> }));

let root, host;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  useParams.mockReturnValue({ slug: 'bmw' });
  Products.list.mockResolvedValue({ items: [] });
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });

test('brand index uses the six approved homepage photos without changing destinations or layout', async () => {
  const brands = Object.keys(HOME_BRAND_PHOTOS).map(slug => ({ slug, name: slug, image: `/old-${slug}.jpg` }));
  Brands.list.mockResolvedValue(brands);
  await act(async () => root.render(<BrandsIndex />));
  const cards = [...host.querySelectorAll('[data-testid="brand-card-index"]')];
  expect(cards).toHaveLength(6);
  cards.forEach((card, index) => {
    const brand = brands[index], photo = HOME_BRAND_PHOTOS[brand.slug];
    const img = card.querySelector('img');
    expect(img.getAttribute('src')).toBe(photo.src);
    expect(img.alt).toBe(fr.home_photos.alts[photo.id]);
    expect(img.getAttribute('width')).toBe(String(photo.width));
    expect(img.loading || img.getAttribute('loading')).toBe('lazy');
    expect(card.getAttribute('href')).toBe(`/brands/${brand.slug}`);
    expect(card.className).toContain('aspect-[4/5]');
  });
});

test.each(Object.keys(HOME_BRAND_PHOTOS))('%s banner reuses its approved photo while products, CTA and filters stay unchanged', async slug => {
  useParams.mockReturnValue({ slug });
  Brands.get.mockResolvedValue({ slug, name: slug, image: '/old-brand.jpg', description: 'Description du catalogue' });
  Products.list.mockResolvedValue({ items: [{ id: 'real-product', name: 'Produit', images: ['/actual-product.jpg'] }] });
  await act(async () => root.render(<BrandDetail />));
  const hero = host.querySelector('[data-testid="catalog-hero"]');
  expect(hero.querySelector('img').getAttribute('src')).toBe(HOME_BRAND_PHOTOS[slug].src);
  expect(hero.querySelector('img').alt).toBe(fr.home_photos.alts[HOME_BRAND_PHOTOS[slug].id]);
  expect(hero.querySelector('a').getAttribute('href')).toBe('/customize');
  expect(host.querySelector('[data-testid="product-photo"] img').getAttribute('src')).toBe('/actual-product.jpg');
  expect(Products.list).toHaveBeenCalledWith({ brand: slug, limit: 100 });
  await act(async () => host.querySelectorAll('[data-testid="brand-filter-chip"]')[1].click());
  expect(Products.list).toHaveBeenLastCalledWith({ brand: slug, limit: 100, category: 'performance' });
});

test('unknown brands retain their backend image; failed images do not remove names or links', async () => {
  Brands.list.mockResolvedValue([{ slug: 'other', name: 'Other', image: '/backend.jpg' }, { slug: 'empty', name: 'Empty' }]);
  await act(async () => root.render(<BrandsIndex />));
  expect(host.querySelectorAll('img')).toHaveLength(1);
  expect(host.querySelector('img').getAttribute('src')).toBe('/backend.jpg');
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('img').hidden).toBe(true);
  expect(host.querySelectorAll('[data-testid="brand-card-index"]')).toHaveLength(2);
  useParams.mockReturnValue({ slug: 'other' });
  Brands.get.mockResolvedValue({ name: 'Other', image: '/backend.jpg' });
  await act(async () => root.render(<BrandDetail />));
  expect(host.querySelector('img').getAttribute('src')).toBe('/backend.jpg');
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('img').hidden).toBe(true);
  expect(host.querySelector('h1').textContent).toBe('Other.');
  expect(host.querySelector('a').getAttribute('href')).toBe('/customize');
});
