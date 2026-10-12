/* global global */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Returns } from './Operations';
import { adminApi } from './api';
import { toast } from 'sonner';

jest.mock('@/lib/api', () => ({ api: {} }));
jest.mock('./api', () => ({ ...jest.requireActual('./api'), adminApi: { get: jest.fn(), patch: jest.fn() } }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });

let root, host, request;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks();
  host = document.createElement('div'); root = createRoot(host);
  request = { id: 'receipt-fixture', name: 'Fixture', email: 'qa@example.test', subject: 'Rétractation TY-TEST', message: '<script>not executable</script>', status: 'new', created_at: '2026-10-12T12:00:00Z' };
  adminApi.get.mockImplementation(async path => ({ items: path === 'withdrawal-requests' ? [{ ...request }] : [], total: path === 'withdrawal-requests' ? 1 : 0, pages: 1 }));
});
afterEach(() => act(() => root.unmount()));

test('withdrawal labels are readable and status updates include the expected version', async () => {
  adminApi.patch.mockImplementation(async (_, data) => { request.status = data.status; return { updated: true }; });
  await act(async () => root.render(<Returns/>));
  const select = [...host.querySelectorAll('select')].find(s => s.options.length === 3);
  expect([...select.options].map(o => o.textContent)).toEqual(['Reçue', 'En traitement', 'Clôturée']);
  expect(host.querySelector('script')).toBeNull();
  await act(async () => { select.value = 'in_progress'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(adminApi.patch).toHaveBeenCalledWith('withdrawal-requests/receipt-fixture', { status: 'in_progress', expected_status: 'new' });
  expect([...host.querySelectorAll('select')].find(s => s.options.length === 3).value).toBe('in_progress');
  expect(toast.success).toHaveBeenCalledWith('Demande mise à jour');
});

test('a concurrent withdrawal update shows an error without claiming a refund', async () => {
  adminApi.patch.mockRejectedValue({ response: { status: 409, data: { detail: 'Request changed. Reload.' } } });
  await act(async () => root.render(<Returns/>));
  const select = [...host.querySelectorAll('select')].find(s => s.options.length === 3);
  await act(async () => { select.value = 'closed'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(toast.error).toHaveBeenCalledWith('Request changed. Reload.');
  expect(toast.success).not.toHaveBeenCalled();
  expect(host.textContent).toContain('Elle ne rembourse pas le paiement');
});
