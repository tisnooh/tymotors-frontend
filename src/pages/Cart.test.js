import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Cart from './Cart';
import { useApp } from '@/contexts/AppContext';
import edits from '@/data/productPhotoEdits.json';
import { Checkout } from '@/lib/api';
jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/lib/api', () => ({ Checkout: { create: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children, ...props }) => <div {...props}>{children}</div> }));
let root, host, cart, updateCart, removeFromCart;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  cart = { items: [{ product_id: 'fixture', slug: 'spoiler', name: 'Spoiler', price: 139, quantity: 2, max_order_quantity: 20 }], subtotal: 278, shipping: 15, total: 293, currency: 'EUR' };
  updateCart = jest.fn(); removeFromCart = jest.fn();
  useApp.mockImplementation(() => ({ cart, updateCart, removeFromCart }));
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });
test('cart uses the API images array and leaves prices and the product destination intact', () => {
  cart.items[0].images = ['/actual-spoiler.jpg'];
  act(() => root.render(<Cart />));
  expect(host.querySelector('img').getAttribute('src')).toBe('/actual-spoiler.jpg');
  expect(host.querySelector('img').className).toContain('object-contain');
  expect(host.querySelector('img').closest('a').className).toContain('h-24 w-24');
  expect(host.querySelector('img').closest('a').getAttribute('href')).toBe('/product/spoiler');
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toContain('293');
});
test('legacy image field is still supported', () => {
  cart.items[0].image = '/legacy.jpg';
  act(() => root.render(<Cart />));
  expect(host.querySelector('img').getAttribute('src')).toBe('/legacy.jpg');
});

test.each(['images', 'image'])('the Golf neutral main photo is used from the %s field without changing totals', field => {
  const [source, edit] = Object.entries(edits)[0];
  cart.items[0][field] = field === 'images' ? [source] : source;
  act(() => root.render(<Cart />));
  expect(host.querySelector('img').getAttribute('src')).toBe(edit.image);
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toContain('293');
});
test('missing or broken image uses a readable fallback, not a different product', () => {
  act(() => root.render(<Cart />));
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).toContain('Image indisponible');
  cart.items[0].images = ['/offline.jpg'];
  act(() => root.render(<Cart />));
  act(() => host.querySelector('img').dispatchEvent(new Event('error')));
  expect(host.querySelector('img')).toBeNull();
  expect(host.querySelector('[role="img"]').getAttribute('aria-label')).toBe('Spoiler');
});

test('two lines of the same product keep distinct keys and target only their cart item ID', () => {
  const first = { ...cart.items[0], cart_item_id: '10000000-0000-4000-8000-000000000001', variant_id: '10000000-0000-4000-8000-000000000011' };
  const second = { ...first, cart_item_id: '10000000-0000-4000-8000-000000000002', variant_id: '10000000-0000-4000-8000-000000000012', quantity: 3 };
  cart.items = [first, second];
  act(() => root.render(<Cart />));
  const nodes = [...host.querySelectorAll('[data-testid="cart-item"]')];
  act(() => nodes[0].querySelector('[aria-label="Augmenter la quantité"]').click());
  act(() => nodes[1].querySelector('[aria-label="Diminuer la quantité"]').click());
  act(() => nodes[1].querySelector('[data-testid="cart-item-remove-button"]').click());
  expect(updateCart.mock.calls).toEqual([['fixture', 3, first.cart_item_id], ['fixture', 2, second.cart_item_id]]);
  expect(removeFromCart.mock.calls).toEqual([['fixture', second.cart_item_id]]);
  cart = { ...cart, items: [second, first] };
  act(() => root.render(<Cart />));
  expect([...host.querySelectorAll('[data-testid="cart-item"]')]).toEqual([nodes[1], nodes[0]]);
});

test('legacy cart rows still target the product and retain the computed total', () => {
  delete cart.shipping; delete cart.total;
  act(() => root.render(<Cart />));
  act(() => host.querySelector('[aria-label="Augmenter la quantité"]').click());
  act(() => host.querySelector('[data-testid="cart-item-remove-button"]').click());
  expect(updateCart).toHaveBeenCalledWith('fixture', 3, undefined);
  expect(removeFromCart).toHaveBeenCalledWith('fixture', undefined);
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toContain('278');
  expect(host.querySelector('[data-testid="cart-shipping"]').textContent).toBe('cart.shipping_free');
});

test.each([
  { shipping_status: 'requires_quote', shipping: null, total: null },
  { shipping_status: 'requires_quote', shipping: 0, total: 278 },
  { shipping: null, total: null },
  { shipping: 'unknown', total: null },
])('unknown shipping is never free or a fabricated zero: %j', values => {
  Object.assign(cart, values, { checkout_available: false });
  act(() => root.render(<Cart />));
  expect(host.querySelector('[data-testid="cart-shipping"]').textContent).toBe('À calculer');
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toBe('À confirmer');
  expect(host.querySelector('[data-testid="cart-shipping"]').textContent).not.toContain('shipping_free');
  const button = host.querySelector('[data-testid="cart-checkout-button"]');
  expect(button.disabled).toBe(true);
  act(() => button.click());
  expect(Checkout.create).not.toHaveBeenCalled();
});

test('an explicit unavailable checkout is disabled even with numeric totals', () => {
  cart.checkout_available = false;
  act(() => root.render(<Cart />));
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toContain('293');
  expect(host.querySelector('[data-testid="cart-checkout-button"]').disabled).toBe(true);
});

test('null total alone stays unknown and blocks checkout, while numeric zero shipping remains free', () => {
  Object.assign(cart, { shipping: 0, total: null });
  act(() => root.render(<Cart />));
  expect(host.querySelector('[data-testid="cart-shipping"]').textContent).toBe('cart.shipping_free');
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toBe('À confirmer');
  expect(host.querySelector('[data-testid="cart-checkout-button"]').disabled).toBe(true);
});
