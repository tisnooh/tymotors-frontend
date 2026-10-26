import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CartPage from './Cart';
import { useApp } from '@/contexts/AppContext';
import { Cart, Checkout } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { cartFixture, checkoutFixture, destination, optionFixture, optionsFixture, quoteFixture } from '@/lib/__fixtures__/cartQuote';

jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null, loading: false }) }));
jest.mock('@/lib/api', () => ({ Cart: { deliveryOptions: jest.fn(), quote: jest.fn() },
  Checkout: { create: jest.fn(), createQuoted: jest.fn() }, getSessionId: () => 'synthetic-guest-session' }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => <a href={to} {...props} /> }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('@/components/shared/Reveal', () => ({ Reveal: ({ children, ...props }) => <div {...props}>{children}</div> }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

let root, host, cart, updateCart;
const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
beforeAll(() => Object.defineProperty(window, 'location', { configurable: true, value: { assign: jest.fn() } }));
afterAll(() => Object.defineProperty(window, 'location', locationDescriptor));
const query = id => host.querySelector(`[data-testid="${id}"]`);
const click = async id => act(async () => query(id).click());
const fill = async () => {
  for (const [field, value] of Object.entries(destination)) {
    if (field === 'country') continue;
    act(() => {
      const input = query(`delivery-${field}`);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
};
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; jest.clearAllMocks();
  let key = 0;
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { randomUUID: () => `30000000-0000-4000-8000-${String(++key).padStart(12, '0')}` } });
  cart = cartFixture(); updateCart = jest.fn();
  useApp.mockImplementation(() => ({ cart, updateCart, removeFromCart: jest.fn() }));
  Cart.deliveryOptions.mockResolvedValue(optionsFixture()); Cart.quote.mockResolvedValue(quoteFixture());
  Checkout.createQuoted.mockResolvedValue(checkoutFixture());
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  await act(async () => root.render(<CartPage />));
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

test('France-only delivery fields reuse existing styles and do not send data while typing', async () => {
  expect(query('delivery-country').disabled).toBe(true);
  expect(query('delivery-country').value).toBe('FR');
  expect(query('delivery-name').className).toContain('bg-[#0F1115]');
  expect(query('delivery-name').className).toContain('border-[#232B3A]');
  expect(query('cart-total').textContent).toBe('À confirmer');
  expect(query('cart-checkout-button').disabled).toBe(true);
  await fill(); expect(Cart.deliveryOptions).not.toHaveBeenCalled(); expect(Cart.quote).not.toHaveBeenCalled();
});
test('submitted address, exact mode and persisted quote drive existing totals and test checkout', async () => {
  await fill(); await click('delivery-calculate');
  expect(Cart.deliveryOptions).toHaveBeenCalledWith(destination);
  expect(query('delivery-mode').value).toBe('verified_test_mode');
  expect(query('delivery-mode').options[1].label).toContain('verified_test_mode');
  expect(query('delivery-mode').querySelector('option span')).toBeNull();
  expect(query('cart-checkout-button').disabled).toBe(true);
  await click('delivery-confirm');
  expect(query('cart-shipping').textContent).toBe(formatPrice(5, 'EUR', 'fr'));
  expect(query('cart-total').textContent).toBe(formatPrice(35, 'EUR', 'fr'));
  expect(query('cart-checkout-button').disabled).toBe(false);
  await act(async () => { query('cart-checkout-button').click(); query('cart-checkout-button').click(); });
  expect(Checkout.createQuoted).toHaveBeenCalledTimes(1);
  expect(Checkout.create).not.toHaveBeenCalled();
  expect(window.location.assign).toHaveBeenCalledTimes(1);
  expect(window.location.assign).toHaveBeenCalledWith(checkoutFixture().url);
});
test('no verified options means no fake free shipping and no legacy fallback', async () => {
  Cart.deliveryOptions.mockResolvedValue(optionsFixture([])); await fill(); await click('delivery-calculate');
  expect(query('delivery-mode')).toBeNull(); expect(query('cart-shipping').textContent).toBe('À calculer');
  expect(query('cart-checkout-button').disabled).toBe(true);
  await click('cart-checkout-button'); expect(Checkout.create).not.toHaveBeenCalled(); expect(Checkout.createQuoted).not.toHaveBeenCalled();
});
test('changing quantity invalidates totals before the mutation response arrives', async () => {
  await fill(); await click('delivery-calculate'); await click('delivery-confirm');
  act(() => host.querySelector('[aria-label="Augmenter la quantité"]').click());
  expect(updateCart).toHaveBeenCalledTimes(1);
  expect(query('cart-checkout-button').disabled).toBe(true);
  expect(query('cart-total').textContent).toBe('À confirmer');
});
test('a rejected cart mutation keeps checkout invalid and displays only a safe error', async () => {
  await fill(); await click('delivery-calculate'); await click('delivery-confirm');
  updateCart.mockRejectedValue(new Error('private supplier details'));
  await act(async () => host.querySelector('[aria-label="Augmenter la quantité"]').click());
  expect(query('cart-checkout-button').disabled).toBe(true);
  expect(toast.error).toHaveBeenCalledWith('Impossible de modifier le panier. Vérifiez son contenu avant de poursuivre.');
});
test('failed or unsafe payment remains blocked without automatic retry or redirect', async () => {
  Checkout.createQuoted.mockRejectedValue(new Error('network unknown'));
  await fill(); await click('delivery-calculate'); await click('delivery-confirm'); await click('cart-checkout-button');
  expect(query('cart-checkout-button').disabled).toBe(true);
  expect(query('delivery-name').disabled).toBe(true);
  expect(query('delivery-error').textContent).toContain('Ne recommencez pas');
  await click('cart-checkout-button'); expect(Checkout.createQuoted).toHaveBeenCalledTimes(1);
  expect(window.location.assign).not.toHaveBeenCalled(); expect(Checkout.create).not.toHaveBeenCalled();
});
test('different quoted shipping cost is rejected, leaving unconfirmed totals', async () => {
  Cart.quote.mockResolvedValue(quoteFixture({ ...optionFixture({ shipping_cents: 600, total_cents: 3600 }) }));
  await fill(); await click('delivery-calculate'); await click('delivery-confirm');
  expect(query('cart-total').textContent).toBe('À confirmer'); expect(query('cart-checkout-button').disabled).toBe(true);
});
test('the existing total keeps included VAT without adding it twice', async () => {
  Cart.deliveryOptions.mockResolvedValue(optionsFixture([optionFixture({ tax_cents: 1500 })]));
  Cart.quote.mockResolvedValue(quoteFixture({ tax_cents: 1500 }));
  await fill(); await click('delivery-calculate'); await click('delivery-confirm');
  expect(query('cart-total').textContent).toBe(formatPrice(35, 'EUR', 'fr'));
  expect(query('cart-checkout-button').disabled).toBe(false);
});
