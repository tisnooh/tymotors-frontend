import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Shop from './Shop';
import { Products, Brands, Categories } from '@/lib/api';
import { readVehicleSelection } from '@/lib/vehicleSelection';

let mockParams = new URLSearchParams();
const mockSetParams = jest.fn();
jest.mock('react-router-dom', () => ({ useSearchParams: () => [mockParams, mockSetParams] }), { virtual: true });
jest.mock('@/lib/api', () => ({ Products: { list: jest.fn() }, Brands: { list: jest.fn() }, Categories: { list: jest.fn() } }));
jest.mock('@/lib/vehicleSelection', () => ({ readVehicleSelection: jest.fn(), saveVehicleSelection: jest.fn(), clearVehicleSelection: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, options = {}) => {
  const text = key.split('.').reduce((value, part) => value?.[part], require('@/lib/locales/fr.json')) || key;
  return typeof text === 'string' ? text.replace(/{{(\w+)}}/g, (_, name) => String(options[name] ?? '')) : key;
} }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children }) => children }));
jest.mock('@/components/shared/ProductCard', () => ({ ProductCard: ({ product }) => <article>{product.name}</article> }));

let root, host;
const part = { id: 'fixture', name: 'Calandre BMW' };
const query = id => host.querySelector(`[data-testid="${id}"]`);
async function render(value = '') { mockParams = new URLSearchParams(value); await act(async () => root.render(<Shop />)); }
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; jest.clearAllMocks();
  host = document.createElement('div'); root = createRoot(host);
  readVehicleSelection.mockReturnValue({}); Brands.list.mockResolvedValue([]); Categories.list.mockResolvedValue([]);
  Products.list.mockResolvedValue({ items: [part], total: 1 });
});
afterEach(() => act(() => root.unmount()));

test('the catalogue actually submits a decoded search term and displays its query', async () => {
  await render('q=calandre+%26+BMW');
  expect(Products.list).toHaveBeenCalledWith({ q: 'calandre & BMW', sort: 'relevance', limit: 100, page: 1 });
  expect(query('shop-search-query').textContent).toContain('calandre & BMW'); expect(host.querySelector('article').textContent).toBe(part.name);
});

test('global search does not silently add the saved vehicle, but explicit filters remain applied', async () => {
  readVehicleSelection.mockReturnValue({ brand: 'bmw', model: 'Série 3' }); await render('q=volant');
  expect(readVehicleSelection).not.toHaveBeenCalled(); expect(Products.list.mock.calls[0][0].brand).toBeUndefined();
  await render('q=volant&brand=mercedes-benz&model=Classe+C&sort=price_asc');
  expect(Products.list).toHaveBeenLastCalledWith({ q: 'volant', brand: 'mercedes-benz', model: 'Classe C', sort: 'price_asc', limit: 100, page: 1 });
});

test('clearing only the search retains explicit vehicle filters and resets pagination', async () => {
  await render('q=volant&brand=mercedes-benz&page=2'); await act(async () => query('shop-clear-query-button').click());
  const next = mockSetParams.mock.calls.at(-1)[0]; expect(next.get('q')).toBeNull(); expect(next.get('brand')).toBe('mercedes-benz'); expect(next.get('page')).toBeNull();
});

test('pagination preserves q and reports server total instead of stopping silently at 100 products', async () => {
  Products.list.mockResolvedValue({ items: [part], total: 150 }); await render('q=calandre');
  expect(query('shop-previous-page').disabled).toBe(true); expect(query('shop-next-page').disabled).toBe(false);
  await act(async () => query('shop-next-page').click()); const next = mockSetParams.mock.calls.at(-1)[0];
  expect(next.get('q')).toBe('calandre'); expect(next.get('page')).toBe('2'); await render(next.toString());
  expect(Products.list).toHaveBeenLastCalledWith({ q: 'calandre', limit: 100, page: 2, sort: 'relevance' });
  expect(query('shop-next-page').disabled).toBe(true); expect(query('shop-results-count').textContent).toContain('150');
});

test('invalid page and overlong Unicode query are bounded before reaching the API', async () => {
  await render(new URLSearchParams({ q: '💎'.repeat(150), page: '-3' }).toString());
  const args = Products.list.mock.calls[0][0]; expect(args.page).toBe(1); expect(Array.from(args.q)).toHaveLength(120);
});

test('failed catalogue load is explicit, does not expose diagnostics and retries the same query', async () => {
  Products.list.mockRejectedValueOnce(new Error('private error payload')); await render('q=calandre');
  expect(host.querySelector('[role="alert"]')).not.toBeNull(); expect(host.textContent).not.toContain('private error payload');
  await act(async () => query('shop-retry-button').click()); expect(host.querySelector('article').textContent).toBe(part.name);
  expect(Products.list).toHaveBeenLastCalledWith({ q: 'calandre', limit: 100, page: 1, sort: 'relevance' });
});

test('malformed product lists fail safely and missing totals fall back only to returned items', async () => {
  Products.list.mockResolvedValueOnce({ items: 'invalid' }); await render('q=calandre'); expect(query('shop-retry-button')).not.toBeNull();
  Products.list.mockResolvedValue({ items: [part] }); await act(async () => query('shop-retry-button').click());
  expect(query('shop-results-count').textContent).toContain('1');
});

test('a late previous query cannot overwrite current catalogue results', async () => {
  let finish; Products.list.mockReturnValueOnce(new Promise(resolve => { finish = resolve; })); await render('q=calandre');
  Products.list.mockResolvedValue({ items: [{ ...part, name: 'Volant actuel' }], total: 1 }); await render('q=volant');
  await act(async () => finish({ items: [part], total: 20 })); expect(host.querySelector('article').textContent).toBe('Volant actuel');
});
