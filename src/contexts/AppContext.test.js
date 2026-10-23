import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useApp } from './AppContext';
import { Cart, Wishlist, Products } from '@/lib/api';
import { useAuth } from './AuthContext';

jest.mock('@/lib/api', () => ({ Cart: { get: jest.fn(), claim: jest.fn(), add: jest.fn(), update: jest.fn(), remove: jest.fn(), clear: jest.fn() },
  Wishlist: { get: jest.fn(), add: jest.fn(), remove: jest.fn() }, Products: { list: jest.fn() } }));
jest.mock('./AuthContext', () => ({ useAuth: jest.fn() }));
let root, state;
const product = '10000000-0000-4000-8000-000000000001';
const variant = '10000000-0000-4000-8000-000000000002';
const line = '10000000-0000-4000-8000-000000000003';
const empty = { items: [], subtotal: 0, shipping: 0, total: 0, currency: 'EUR' };
const serverCart = { items: [{ id: product, product_id: product, cart_item_id: line, variant_id: variant, quantity: 2 }],
  subtotal: 278, shipping: null, total: null, shipping_status: 'requires_quote', checkout_available: false, currency: 'EUR' };
function Probe() { state = useApp(); return null; }
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  useAuth.mockReturnValue({ user: null, loading: false });
  Cart.get.mockResolvedValue(empty); Cart.claim.mockResolvedValue(empty);
  Cart.add.mockResolvedValue(serverCart); Cart.update.mockResolvedValue(serverCart); Cart.remove.mockResolvedValue(empty);
  Cart.clear.mockResolvedValue(empty); Wishlist.get.mockResolvedValue({ items: [] }); Products.list.mockResolvedValue({ items: [] });
  root = createRoot(document.createElement('div'));
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });
const render = async () => act(async () => root.render(<AppProvider><Probe /></AppProvider>));

test('the optional fourth variant argument and complete vehicle reach Cart.add, and server null totals are preserved', async () => {
  await render();
  const vehicle = { brand_slug: 'bmw', model: 'Série 3', chassis: 'F30', generation: 'F30 phase 2', year: 2016,
    body_type: 'Berline', trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: null };
  await act(async () => state.addToCart(product, 2, vehicle, variant));
  expect(Cart.add.mock.calls).toEqual([[product, 2, vehicle, variant]]);
  expect(state.cart).toBe(serverCart);
  expect(state.cartCount).toBe(2);
  expect(state.cart.total).toBeNull();
  expect(state.cart.items[0]).toMatchObject({ id: product, cart_item_id: line, variant_id: variant });
});

test('update and removal pass the line identifier separately from product ID', async () => {
  await render();
  await act(async () => state.updateCart(product, 3, line));
  expect(Cart.update.mock.calls).toEqual([[product, 3, line]]);
  await act(async () => state.removeFromCart(product, line));
  expect(Cart.remove.mock.calls).toEqual([[product, line]]);
  expect(state.cart).toBe(empty);
});

test.each([undefined, null])('old callers with optional identifiers %j retain old argument shapes', async optional => {
  await render();
  await act(async () => state.addToCart(product, undefined, undefined, optional));
  await act(async () => state.updateCart(product, 1, optional));
  await act(async () => state.removeFromCart(product, optional));
  expect(Cart.add.mock.calls).toEqual([[product, 1, null]]);
  expect(Cart.update.mock.calls).toEqual([[product, 1]]);
  expect(Cart.remove.mock.calls).toEqual([[product]]);
});
