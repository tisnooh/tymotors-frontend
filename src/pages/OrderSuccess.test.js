import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import OrderSuccess from './OrderSuccess';
import { Checkout } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/lib/api', () => ({ Checkout: { get: jest.fn() }, getSessionId: () => 'guest-fixture' }));
jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('@/contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('react-router-dom', () => ({ useSearchParams: jest.fn(),
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });

let root, host, refreshCart;
const receipt = overrides => ({ paid: true, payment_status: 'paid', order_reference: 'TY-SYNTHETIC',
  items: [], shipping: 0, total: 35, currency: 'EUR', ...overrides });
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks(); jest.useFakeTimers();
  useSearchParams.mockReturnValue([new URLSearchParams('session_id=cs_test_fixture')]);
  useAuth.mockReturnValue({ user: null, loading: false });
  refreshCart = jest.fn(); useApp.mockReturnValue({ refreshCart });
  host = document.createElement('div'); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); jest.useRealTimers(); });
const render = () => act(async () => { root.render(<OrderSuccess />); });

test('a transient confirmation outage retries the read, never a new payment', async () => {
  Checkout.get.mockRejectedValueOnce({ response: { status: 503 } }).mockResolvedValueOnce(receipt());
  await render(); expect(host.textContent).toContain('Vérification sécurisée');
  await act(async () => { jest.advanceTimersByTime(2000); });
  expect(host.textContent).toContain('Paiement confirmé');
  expect(Checkout.get).toHaveBeenCalledTimes(2); expect(refreshCart).toHaveBeenCalledTimes(1);
});

test('an inaccessible receipt does not retry or display an old receipt', async () => {
  Checkout.get.mockResolvedValueOnce(receipt()); await render();
  expect(host.textContent).toContain('TY-SYNTHETIC');
  useSearchParams.mockReturnValue([new URLSearchParams('session_id=cs_test_other')]);
  Checkout.get.mockRejectedValueOnce({ response: { status: 404 } }); await render();
  expect(host.textContent).not.toContain('TY-SYNTHETIC');
  expect(host.textContent).toContain('Confirmation indisponible');
  await act(async () => { jest.advanceTimersByTime(60000); });
  expect(Checkout.get).toHaveBeenCalledTimes(2);
});

test.each([['failed', 'Paiement non abouti'], ['refunded', 'Paiement remboursé']])('terminal %s is not displayed as pending', async (payment_status, title) => {
  Checkout.get.mockResolvedValue(receipt({ paid: false, payment_status })); await render();
  expect(host.textContent).toContain(title);
  expect(host.textContent).not.toContain('La validation attend');
  await act(async () => { jest.advanceTimersByTime(60000); });
  expect(Checkout.get).toHaveBeenCalledTimes(1);
});

test('pending confirmation retries are bounded', async () => {
  Checkout.get.mockRejectedValue({ response: { status: 503 } }); await render();
  for (let n = 0; n < 15; n++) await act(async () => { jest.advanceTimersByTime(2000); });
  expect(Checkout.get).toHaveBeenCalledTimes(15);
  expect(host.textContent).toContain('Confirmation indisponible');
});

test('confirmation waits for restored authentication before reading the owned receipt', async () => {
  useAuth.mockReturnValue({ user: null, loading: true });
  Checkout.get.mockResolvedValue(receipt()); await render();
  expect(Checkout.get).not.toHaveBeenCalled();
  useAuth.mockReturnValue({ user: { id: 'owner-a' }, loading: false }); await render();
  expect(host.textContent).toContain('Paiement confirmé');
  expect(Checkout.get).toHaveBeenCalledTimes(1);
});

test('owner changes immediately hide the previous receipt while the new ownership check runs', async () => {
  useAuth.mockReturnValue({ user: { id: 'owner-a' }, loading: false });
  Checkout.get.mockResolvedValueOnce(receipt()); await render();
  expect(host.textContent).toContain('TY-SYNTHETIC');
  useAuth.mockReturnValue({ user: { id: 'owner-b' }, loading: false });
  Checkout.get.mockReturnValue(new Promise(() => {})); await render();
  expect(host.textContent).not.toContain('TY-SYNTHETIC');
  expect(host.textContent).toContain('Vérification sécurisée');
});
