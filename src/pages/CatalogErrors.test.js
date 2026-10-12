import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CategoryPage from './CategoryPage';
import BrandDetail from './BrandDetail';
import BrandsIndex from './BrandsIndex';
import { Categories, Brands, Products } from '@/lib/api';
jest.mock('@/lib/api', () => ({ Categories: { get: jest.fn() }, Brands: { get: jest.fn(), list: jest.fn() }, Products: { list: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ slug: 'missing' }), Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('@/components/shared/ProductCard', () => ({ ProductCard: () => null }));
let root, host;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); root = createRoot(host); jest.clearAllMocks(); Products.list.mockRejectedValue(new Error('offline')); });
afterEach(() => { act(() => root.unmount()); });
test('missing category exits loading and offers a catalog link', async () => {
  Categories.get.mockRejectedValue({ response: { status: 404 } });
  await act(async () => root.render(<CategoryPage/>));
  expect(host.textContent).toContain('Catégorie introuvable');
  expect(host.querySelector('a').getAttribute('href')).toBe('/shop');
});
test('missing brand exits loading, including a failed products request', async () => {
  Brands.get.mockRejectedValue({ response: { status: 404 } });
  await act(async () => root.render(<BrandDetail/>));
  expect(host.textContent).toContain('Marque introuvable');
});
test('brand index handles backend failure explicitly', async () => {
  Brands.list.mockRejectedValue(new Error('offline'));
  await act(async () => root.render(<BrandsIndex/>));
  expect(host.querySelector('[role="alert"]').textContent).toContain('indisponibles');
});
