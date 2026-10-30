import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import useCartQuote from './useCartQuote';
import { useAuth } from '@/contexts/AuthContext';
import { Cart, Checkout } from '@/lib/api';
import { cartFixture, checkoutFixture, destination, optionFixture, optionsFixture, quoteFixture } from '@/lib/__fixtures__/cartQuote';

jest.mock('@/contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/api', () => ({ Cart: { deliveryOptions: jest.fn(), quote: jest.fn() },
  Checkout: { createQuoted: jest.fn() }, getSessionId: () => 'synthetic-guest-session' }));
let root, delivery, cart;
function Probe() { delivery = useCartQuote(cart); return null; }
const render = async () => act(async () => root.render(<Probe />));
const fill = () => act(() => Object.entries(destination).forEach(([field, value]) => delivery.setField(field, value)));
const ready = async () => { fill(); await act(async () => delivery.calculate()); await act(async () => delivery.confirm()); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks(); jest.useFakeTimers('modern'); jest.setSystemTime(new Date('2026-10-25T12:00:00Z'));
  let key = 0;
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { randomUUID: () => `20000000-0000-4000-8000-${String(++key).padStart(12, '0')}` } });
  useAuth.mockReturnValue({ user: null, loading: false });
  Cart.deliveryOptions.mockResolvedValue(optionsFixture()); Cart.quote.mockResolvedValue(quoteFixture());
  Checkout.createQuoted.mockResolvedValue(checkoutFixture());
  cart = cartFixture(); root = createRoot(document.createElement('div')); await render();
});
afterEach(() => { act(() => root.unmount()); jest.useRealTimers(); jest.restoreAllMocks(); });

test('typing neither sends nor persists the delivery address', () => {
  const storage = jest.spyOn(Storage.prototype, 'setItem'); fill();
  expect(delivery.destination).toEqual(destination);
  expect(Cart.deliveryOptions).not.toHaveBeenCalled(); expect(Cart.quote).not.toHaveBeenCalled();
  expect(storage).not.toHaveBeenCalled();
});
test('valid options and quote enable only exact linked test checkout', async () => {
  await ready();
  expect(Cart.deliveryOptions).toHaveBeenCalledWith(destination);
  expect(Cart.quote).toHaveBeenCalledWith({ request_key: expect.any(String), destination, mode: 'verified_test_mode' });
  expect(delivery.ready).toBe(true);
  let url; await act(async () => { url = await delivery.checkout(); });
  expect(url).toBe(checkoutFixture().url); expect(Checkout.createQuoted).toHaveBeenCalledTimes(1);
  expect(delivery.ready).toBe(false); expect(delivery.holding).toBe(true);
});

test('an exact live session approved by the backend can redirect, while mismatched identities stay locked', async () => {
  const live = checkoutFixture({ is_test: false, session_id: 'cs_live_hook_fixture',
    url: 'https://checkout.stripe.com/c/pay/cs_live_hook_fixture#opaque' });
  Checkout.createQuoted.mockResolvedValue(live);
  await ready();
  let url; await act(async () => { url = await delivery.checkout(); });
  expect(url).toBe(live.url);
  expect(Checkout.createQuoted).toHaveBeenCalledTimes(1);
  expect(delivery.holding).toBe(true);
});
test('invalid address never reaches the server', async () => {
  await act(async () => delivery.calculate());
  expect(Cart.deliveryOptions).not.toHaveBeenCalled(); expect(delivery.error).toBeTruthy();
});
test('empty options never invent a free or default shipping method', async () => {
  Cart.deliveryOptions.mockResolvedValue(optionsFixture([])); fill();
  await act(async () => delivery.calculate()); await act(async () => delivery.confirm());
  expect(delivery.options).toEqual([]); expect(delivery.ready).toBe(false); expect(Cart.quote).not.toHaveBeenCalled();
});
test('multiple modes require an exact selection from the server list', async () => {
  Cart.deliveryOptions.mockResolvedValue(optionsFixture([optionFixture(), optionFixture({ mode: 'other' })])); fill();
  await act(async () => delivery.calculate());
  expect(delivery.mode).toBe(''); act(() => delivery.setMode('fabricated'));
  await act(async () => delivery.confirm()); expect(Cart.quote).not.toHaveBeenCalled();
  act(() => delivery.setMode('other')); Cart.quote.mockResolvedValue(quoteFixture({ mode: 'other' }));
  await act(async () => delivery.confirm()); expect(delivery.ready).toBe(true);
});
test.each(['address', 'mode', 'cart', 'owner', 'loading'])('%s change immediately invalidates the quote', async kind => {
  await ready();
  if (kind === 'address') act(() => delivery.setField('city', 'Lyon'));
  if (kind === 'mode') act(() => delivery.setMode('verified_test_mode'));
  if (kind === 'cart') { cart = { ...cart, items: [{ ...cart.items[0], quantity: 3 }] }; await render(); }
  if (kind === 'owner') { useAuth.mockReturnValue({ user: { id: 'different-owner' }, loading: false }); await render(); expect(delivery.destination.name).toBe(''); }
  if (kind === 'loading') { useAuth.mockReturnValue({ user: null, loading: true }); await render(); }
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
});
test('expiration disables checkout even after the 60-second clock tick', async () => {
  await ready();
  act(() => jest.advanceTimersByTime(60001)); expect(delivery.ready).toBe(true);
  act(() => jest.advanceTimersByTime(60001)); expect(delivery.ready).toBe(true);
  act(() => jest.advanceTimersByTime(60001));
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
  await act(async () => delivery.checkout()); expect(Checkout.createQuoted).not.toHaveBeenCalled();
});
test('an edited address discards a slow options response', async () => {
  const pending = deferred(); Cart.deliveryOptions.mockReturnValue(pending.promise); fill();
  let request; act(() => { request = delivery.calculate(); });
  act(() => delivery.setField('postal_code', '69001'));
  await act(async () => { pending.resolve(optionsFixture()); await request; });
  expect(delivery.options).toEqual([]); expect(delivery.quote).toBeNull();
});
test('a changed cart discards a slow quote response', async () => {
  fill(); await act(async () => delivery.calculate());
  const pending = deferred(); Cart.quote.mockReturnValue(pending.promise);
  let request; act(() => { request = delivery.confirm(); });
  cart = { ...cart, items: [{ ...cart.items[0], quantity: 3 }] }; await render();
  await act(async () => { pending.resolve(quoteFixture()); await request; });
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
});
test('changed pricing is rejected, not silently accepted in a new quote', async () => {
  Cart.quote.mockResolvedValue(quoteFixture({ shipping_cents: 600, total_cents: 3600 })); await ready();
  expect(delivery.quote).toBeNull(); expect(delivery.options).toEqual([]); expect(delivery.error).toBeTruthy();
});
test('double submit creates only one quote and one payment request', async () => {
  fill(); await act(async () => delivery.calculate());
  await act(async () => { await Promise.all([delivery.confirm(), delivery.confirm()]); });
  expect(Cart.quote).toHaveBeenCalledTimes(1);
  await act(async () => { await Promise.all([delivery.checkout(), delivery.checkout()]); });
  expect(Checkout.createQuoted).toHaveBeenCalledTimes(1);
});
test('payment timeout locks further writes and never automatically retries', async () => {
  Checkout.createQuoted.mockRejectedValue(new Error('timeout')); await ready();
  await act(async () => delivery.checkout()); await act(async () => delivery.checkout());
  act(() => delivery.setField('city', 'Lyon')); await act(async () => delivery.calculate());
  expect(Checkout.createQuoted).toHaveBeenCalledTimes(1); expect(Cart.deliveryOptions).toHaveBeenCalledTimes(1);
  expect(delivery.destination.city).toBe('Paris'); expect(delivery.holding).toBe(true);
  expect(delivery.error).toContain('Ne recommencez pas');
});
test('unsafe payment URL locks checkout without returning any redirect', async () => {
  Checkout.createQuoted.mockResolvedValue(checkoutFixture({ url: 'https://evil.example/' })); await ready();
  let result; await act(async () => { result = await delivery.checkout(); });
  expect(result).toBeNull(); expect(delivery.holding).toBe(true);
});
test('a different owner never receives a slow payment redirect', async () => {
  const pending = deferred(); Checkout.createQuoted.mockReturnValue(pending.promise); await ready();
  let request; act(() => { request = delivery.checkout(); });
  useAuth.mockReturnValue({ user: { id: 'new-owner' }, loading: false }); await render();
  let result; await act(async () => { pending.resolve(checkoutFixture()); result = await request; });
  expect(result).toBeNull(); expect(delivery.quote).toBeNull();
});
test('explicit cart mutation invalidates before any update request returns', async () => {
  await ready(); act(() => delivery.invalidate());
  expect(delivery.quote).toBeNull(); await act(async () => delivery.checkout());
  expect(Checkout.createQuoted).not.toHaveBeenCalled();
});

test('address A to B to A never resurrects an old quote', async () => {
  await ready();
  act(() => delivery.setField('postal_code', '69001'));
  act(() => delivery.setField('postal_code', '75001'));
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
  await act(async () => delivery.checkout()); expect(Checkout.createQuoted).not.toHaveBeenCalled();
});

test('cart A to B to A never resurrects an old quote', async () => {
  await ready(); const original = cart;
  cart = { ...cart, items: [{ ...cart.items[0], quantity: 3 }] }; await render();
  cart = original; await render();
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
});

test('owner A to B to A never restores the former owner address or quote', async () => {
  await ready();
  useAuth.mockReturnValue({ user: { id: 'different-owner' }, loading: false }); await render();
  useAuth.mockReturnValue({ user: null, loading: false }); await render();
  expect(delivery.destination.name).toBe(''); expect(delivery.quote).toBeNull();
  expect(delivery.ready).toBe(false);
});

test('explicit recalculation discards approval immediately while request is pending', async () => {
  await ready(); const pending = deferred(); Cart.deliveryOptions.mockReturnValue(pending.promise);
  let request; act(() => { request = delivery.calculate(); });
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
  await act(async () => { pending.resolve(optionsFixture()); await request; });
  expect(delivery.quote).toBeNull(); expect(delivery.ready).toBe(false);
});
