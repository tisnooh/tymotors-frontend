import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Cart from './Cart';
import { useApp } from '@/contexts/AppContext';
import edits from '@/data/productPhotoEdits.json';
import { Checkout, SiteConfig } from '@/lib/api';
import { toast } from 'sonner';
jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/lib/api', () => ({ Checkout: { create: jest.fn() }, SiteConfig: { get: jest.fn() } }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children, ...props }) => <div {...props}>{children}</div> }));
let root, host, cart;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div'); root = createRoot(host);
  cart = { items: [{ product_id: 'fixture', slug: 'spoiler', name: 'Spoiler', price: 139, quantity: 2, max_order_quantity: 20 }], subtotal: 278, shipping: 15, total: 293, currency: 'EUR' };
  SiteConfig.get.mockReturnValue(new Promise(() => {}));
  useApp.mockImplementation(() => ({ cart, updateCart: jest.fn(), removeFromCart: jest.fn(), refreshCart: jest.fn() }));
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

test('test mode does not offer checkout or claim a live payment', async () => {
  SiteConfig.get.mockResolvedValue({ stripe_mode: 'test', legal_ready: false });
  await act(async () => root.render(<Cart />));
  const button = host.querySelector('[data-testid="cart-checkout-button"]');
  expect(button.disabled).toBe(true);
  expect(host.textContent).not.toContain('STRIPE TEST');
  button.click();
  expect(Checkout.create).not.toHaveBeenCalled();
});

test('live checkout opens only for an available compatible item', async () => {
  SiteConfig.get.mockResolvedValue({ stripe_mode: 'live', legal_ready: true });
  cart.items[0].purchase_available = true;
  cart.items[0].compatibility_result = { status: 'compatible' };
  await act(async () => root.render(<Cart />));
  expect(host.querySelector('[data-testid="cart-checkout-button"]').disabled).toBe(false);
  expect(host.textContent).toContain('Paiement sécurisé par Stripe');
  expect(host.textContent).not.toContain('environnement de test');
});

test.each([false, true])('a rejected cart quantity change reports the error even if refresh fails (%s)', async (refreshFails) => {
  const updateCart = jest.fn().mockRejectedValue(new Error('stock changed'));
  const refreshCart = jest.fn()[refreshFails ? 'mockRejectedValue' : 'mockResolvedValue'](refreshFails ? new Error('offline') : undefined);
  useApp.mockImplementation(() => ({ cart, updateCart, removeFromCart: jest.fn(), refreshCart }));
  await act(async () => root.render(<Cart />));
  await act(async () => host.querySelector('button[aria-label="Augmenter la quantité"]').click());
  expect(updateCart).toHaveBeenCalledWith('fixture', 3);
  expect(refreshCart).toHaveBeenCalledTimes(1);
  expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Impossible de modifier'));
});
