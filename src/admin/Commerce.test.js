import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { OrderDetail } from './Commerce';
import { useData } from './ui';
import { adminApi } from './api';
import { toast } from 'sonner';

jest.mock('@/lib/api', () => ({ api: {} }));
jest.mock('./api', () => ({ ...jest.requireActual('./api'), adminApi: { put: jest.fn() } }));
jest.mock('./ui', () => ({ ...jest.requireActual('./ui'), useData: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ id: 'fixture' }),
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });

let root, host, order;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true; jest.clearAllMocks();
  order = { id: 'fixture', order_number: 'TY-FIXTURE', created_at: '2026-10-30T12:00:00Z',
    updated_at: '2026-10-30T12:00:00Z', fulfillment_status: 'requires_review',
    payment_status: 'paid', status: 'paid', items: [], returns: [], history: [],
    total_cents: 1000, supplier_order: { status: 'pending_validation', updated_at: 'fixture-version', items: [] } };
  useData.mockImplementation(() => ({ data: order, loading: false, reload: jest.fn() }));
  host = document.createElement('div'); root = createRoot(host);
});
afterEach(() => act(() => root.unmount()));

test.each(['stripe_profile_ref', 'commerce_quote_id'])('context %s never writes through legacy global or supplier forms', async field => {
  order[field] = 'context-fixture'; await act(async () => root.render(<OrderDetail />));
  const forms = host.querySelectorAll('form');
  await act(async () => forms[0].dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  await act(async () => forms[1].dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(adminApi.put).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledTimes(2);
});
