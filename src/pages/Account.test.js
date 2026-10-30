import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Account from './Account';
import { Account as AccountApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/lib/api', () => ({ Account: { get: jest.fn(), orders: jest.fn(), emailPreferences: jest.fn() } }));
jest.mock('@/contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('react-router-dom', () => ({ useParams: () => ({}), Navigate: () => null,
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
let root, host;
const order = number => ({ id: number, order_number: number, total_cents: 1000,
  currency: 'EUR', payment_status: 'paid', fulfillment_status: 'requires_review', tracking_events: [] });
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { resolve, promise }; };
const render = () => act(async () => { root.render(<Account />); });
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { id: 'owner-a', email: 'a@example.test' }, loading: false });
  AccountApi.get.mockResolvedValue({ full_name: 'Client A' });
  AccountApi.orders.mockResolvedValue({ items: [order('TY-OWNER-A')] });
  AccountApi.emailPreferences.mockResolvedValue({ newsletter: false });
  host = document.createElement('div'); root = createRoot(host);
});
afterEach(() => act(() => root.unmount()));

test('newsletter outage does not hide paid orders or profile', async () => {
  AccountApi.emailPreferences.mockRejectedValue(new Error('temporary outage'));
  await render();
  expect(host.textContent).toContain('TY-OWNER-A');
  expect(host.querySelector('input').value).toBe('Client A');
  expect(host.textContent).toContain('momentanément indisponibles');
});

test('switching owners never displays old data while the next account loads', async () => {
  await render(); expect(host.textContent).toContain('TY-OWNER-A');
  const pending = deferred(); AccountApi.orders.mockReturnValue(pending.promise);
  useAuth.mockReturnValue({ user: { id: 'owner-b', email: 'b@example.test' }, loading: false });
  await render(); expect(host.textContent).not.toContain('TY-OWNER-A');
  await act(async () => pending.resolve({ items: [order('TY-OWNER-B')] }));
  expect(host.textContent).toContain('TY-OWNER-B');
});

test('a late response for an old owner cannot replace the current owners orders', async () => {
  const old = deferred(); AccountApi.orders.mockReturnValueOnce(old.promise);
  await render();
  useAuth.mockReturnValue({ user: { id: 'owner-b', email: 'b@example.test' }, loading: false });
  AccountApi.orders.mockResolvedValue({ items: [order('TY-OWNER-B')] }); await render();
  await act(async () => old.resolve({ items: [order('TY-OWNER-A')] }));
  expect(host.textContent).toContain('TY-OWNER-B'); expect(host.textContent).not.toContain('TY-OWNER-A');
});
