import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Cart from './Cart';
import { useApp } from '@/contexts/AppContext';
jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/lib/api', () => ({ Checkout: { create: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children, ...props }) => <div {...props}>{children}</div> }));
let root, host, cart;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  cart = { items: [{ product_id: 'fixture', slug: 'spoiler', name: 'Spoiler', price: 139, quantity: 2, max_order_quantity: 20 }], subtotal: 278, shipping: 15, total: 293, currency: 'EUR' };
  useApp.mockImplementation(() => ({ cart, updateCart: jest.fn(), removeFromCart: jest.fn() }));
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });
test('cart uses the API images array and leaves prices and the product destination intact', () => {
  cart.items[0].images = ['/actual-spoiler.jpg'];
  act(() => root.render(<Cart />));
  expect(host.querySelector('img').getAttribute('src')).toBe('/actual-spoiler.jpg');
  expect(host.querySelector('img').className).toContain('object-contain');
  expect(host.querySelector('img').closest('a').getAttribute('href')).toBe('/product/spoiler');
  expect(host.querySelector('[data-testid="cart-total"]').textContent).toContain('293');
});
test('legacy image field is still supported', () => {
  cart.items[0].image = '/legacy.jpg';
  act(() => root.render(<Cart />));
  expect(host.querySelector('img').getAttribute('src')).toBe('/legacy.jpg');
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
