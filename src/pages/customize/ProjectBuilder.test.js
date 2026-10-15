import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ProjectBuilder } from './ProjectBuilder';
import { Products } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { availableForProject, checkedFit, projectTotals, vehiclePayload } from './project';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';

let mockLinkState;
jest.mock('react-router-dom', () => ({ Link: ({ to, state, ...props }) => { if (state) mockLinkState = state; return <a href={to} {...props} />; } }), { virtual: true });
jest.mock('@/lib/api', () => ({ Products: { list: jest.fn(), get: jest.fn(), checkCompatibility: jest.fn() } }));
jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'fr' }, t: (key, options = {}) => {
  const value = key.split('.').reduce((item, part) => item?.[part], require('@/lib/locales/fr.json')) || key;
  return value.replace(/{{(\w+)}}/g, (_, field) => String(options[field] ?? ''));
} }) }));
const selection = { brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2020', body_type: 'Berline', trim: 'AMG Line', has_camera: false, has_parking_sensors: true };
const part = { id: 'part-1', slug: 'calandre-w177', name: 'Calandre W177', price: 199, currency: 'EUR', images: ['/part.jpg'], status: 'active', stock: 3, max_order_quantity: 3, purchase_available: true, test_purchase: false };
let root, host, addToCart, onBusyChange;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  addToCart = jest.fn().mockResolvedValue({ items: [] }); onBusyChange = jest.fn();
  useApp.mockReturnValue({ addToCart });
  Products.list.mockResolvedValue({ items: [part], total: 1 });
  Products.get.mockResolvedValue(part);
  Products.checkCompatibility.mockResolvedValue({ status: 'compatible', compatibility: { is_verified: true } });
  mockLinkState = null;
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });
const cartButton = () => host.querySelector('[data-testid="customize-add-project"]');
const render = async (vehicle = selection, props = {}) => act(async () => root.render(<ProjectBuilder key={JSON.stringify(vehicle)} selection={vehicle} brandName="Mercedes-Benz" onBusyChange={onBusyChange} {...props} />));
const choose = async (index = 0) => act(async () => host.querySelectorAll('.customize-select-part')[index].click());

test('equipment appears without hotspots and filtering, paging and retry use real catalogue parameters', async () => {
  Products.list.mockResolvedValue({ items: [part], total: 25 });
  await render();
  expect(Products.list).toHaveBeenLastCalledWith({ brand: 'mercedes-benz', model: 'Classe A', chassis: 'W177', year: 2020, body_type: 'Berline', limit: 12, page: 1 });
  expect(host.querySelectorAll('[data-testid="customize-equipment"]')).toHaveLength(1);
  expect(host.textContent).toContain('Compatibilité à vérifier');
  expect(cartButton().disabled).toBe(true);
  await act(async () => host.querySelectorAll('.customize-filters button')[2].click());
  expect(Products.list.mock.calls.at(-1)[0].category).toBe('interior');
  await act(async () => host.querySelectorAll('.customize-pagination button')[1].click());
  expect(Products.list.mock.calls.at(-1)[0].page).toBe(2);
  await act(async () => host.querySelectorAll('.customize-filters button')[1].click());
  expect(Products.list.mock.calls.at(-1)[0]).toMatchObject({ page: 1, category: 'performance' });
});

test('select, total, removal and cart revalidation preserve the exact selected vehicle', async () => {
  await render(); await choose();
  expect(Products.checkCompatibility).toHaveBeenCalledWith(part.slug, vehiclePayload(selection));
  expect(cartButton().disabled).toBe(false);
  expect(host.querySelector('.customize-total').textContent).toContain('199');
  expect(mockLinkState.customizeRequest.message).toContain('Classe A');
  expect(mockLinkState.customizeRequest.message).toContain('Calandre W177');
  expect(mockLinkState.customizeRequest.message).toContain('Caméra avant d’origine : Non');
  expect(host.querySelector('.customize-project-dock a').getAttribute('href')).toBe('#customize-summary-title');
  expect(addToCart).not.toHaveBeenCalled();
  await act(async () => cartButton().click());
  expect(Products.get).toHaveBeenCalledWith(part.slug);
  expect(Products.checkCompatibility).toHaveBeenCalledTimes(2);
  expect(addToCart).toHaveBeenCalledWith(part.id, 1, vehiclePayload(selection));
  expect(host.querySelector('.customize-summary li')).toBeNull();
  expect(host.textContent).toContain('1 pièce(s) ajoutée(s)');
  expect(onBusyChange.mock.calls.map(args => args[0])).toEqual([true, false]);
});

test.each(['confirm', 'unknown', 'incompatible'])('%s never unlocks cart and the selection can be removed', async status => {
  Products.checkCompatibility.mockResolvedValue({ status });
  await render(); await choose();
  expect(cartButton().disabled).toBe(true);
  expect(host.querySelector('.customize-summary [data-fit]').dataset.fit).toBe(status);
  await act(async () => host.querySelector('.customize-summary li button').click());
  expect(host.querySelector('.customize-summary li')).toBeNull();
  expect(addToCart).not.toHaveBeenCalled();
});

test('a missing year or unknown required equipment remains to confirm even if API says compatible', async () => {
  await render({ ...selection, year: '' }); await choose();
  expect(cartButton().disabled).toBe(true);
  expect(host.querySelector('.customize-summary [data-fit]').dataset.fit).toBe('confirm');
  expect(checkedFit({ status: 'compatible', compatibility: { camera_compatible: false } }, { ...vehiclePayload(selection), has_camera: null })).toBe('confirm');
  expect(checkedFit({ status: 'compatible', compatibility: { excluded_trims: ['AMG'] } }, { ...vehiclePayload(selection), trim: null })).toBe('confirm');
});

test.each([
  { status: 'draft', test_purchase: true, stock: 0 },
  { stock: 0 }, { purchase_available: false }, { max_order_quantity: 0 },
])('draft/test/unavailable equipment cannot be purchased: %j', async change => {
  Products.list.mockResolvedValue({ items: [{ ...part, ...change }], total: 1 });
  await render(); await choose(); expect(cartButton().disabled).toBe(true);
  expect(addToCart).not.toHaveBeenCalled();
});

test('stock or price changes at submission stop before a cart write', async () => {
  await render(); await choose();
  Products.get.mockResolvedValue({ ...part, price: 220 });
  await act(async () => cartButton().click());
  expect(addToCart).not.toHaveBeenCalled();
  expect(host.querySelector('.customize-summary [role="alert"]')).not.toBeNull();
  expect(host.querySelector('.customize-total').textContent).toContain('220');
});

test('partial cart failure removes only successful additions so retry does not duplicate them', async () => {
  const second = { ...part, id: 'part-2', slug: 'diffuseur-w177', name: 'Diffuseur W177', price: 50 };
  Products.list.mockResolvedValue({ items: [part, second], total: 2 });
  Products.get.mockImplementation(slug => Promise.resolve(slug === part.slug ? part : second));
  addToCart.mockResolvedValueOnce({ items: [] }).mockRejectedValueOnce(new Error('private failure'));
  await render(); await choose(0); await choose(1);
  expect(host.querySelector('.customize-total').textContent).toContain('249');
  await act(async () => cartButton().click());
  expect(host.querySelectorAll('.customize-summary li')).toHaveLength(1);
  expect(host.querySelector('.customize-summary li').textContent).toContain(second.name);
  expect(host.textContent).not.toContain('private failure');
  expect(host.textContent).toContain('1 pièce(s) ajoutée(s). Les autres');
  await act(async () => cartButton().click());
  expect(addToCart.mock.calls.map(args => args[0])).toEqual([part.id, second.id, second.id]);
});

test('late compatibility responses cannot restore removed parts or an old vehicle project', async () => {
  let finish;
  Products.checkCompatibility.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  await render(); await choose();
  await act(async () => host.querySelector('.customize-summary li button').click());
  await act(async () => finish({ status: 'compatible' }));
  expect(host.querySelector('.customize-summary li')).toBeNull();
  await choose();
  await render({ ...selection, generation: 'W176' });
  expect(host.querySelector('.customize-summary li')).toBeNull();
  expect(cartButton().disabled).toBe(true);
});

test('catalogue and verification failures are explicit and retryable, not presented as compatibility', async () => {
  Products.list.mockRejectedValueOnce(new Error('offline'));
  await render(); expect(host.querySelector('[role="alert"]')).not.toBeNull();
  await act(async () => host.querySelector('.customize-state button').click());
  Products.checkCompatibility.mockRejectedValueOnce(new Error('offline'));
  await choose(); expect(host.querySelector('.customize-summary [data-fit]').dataset.fit).toBe('error');
  expect(cartButton().disabled).toBe(true);
});

test('empty catalogue retains support access and translation keys match in both languages', async () => {
  Products.list.mockResolvedValue({ items: [], total: 0 }); await render();
  expect(host.querySelector('.customize-state a').getAttribute('href')).toBe('/support/contact');
  expect(Object.keys(fr.customize.project)).toEqual(Object.keys(en.customize.project));
  expect(projectTotals([{ product: { price: 0.1, currency: 'EUR' } }, { product: { price: 0.2, currency: 'EUR' } }])).toEqual({ EUR: 30 });
  expect(availableForProject({ ...part, price: NaN })).toBe(false);
});
