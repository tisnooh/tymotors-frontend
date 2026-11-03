/* global global */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Returns, CjStatusPanel, ZeroCheckoutDiagnosticPanel } from './Operations';
import { adminApi } from './api';
import { toast } from 'sonner';

jest.mock('@/lib/api', () => ({ api: {} }));
jest.mock('./api', () => ({ ...jest.requireActual('./api'), adminApi: { get: jest.fn(), patch: jest.fn(), post: jest.fn() } }));
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

test('CJ status distinguishes authentication from missing product connections', async () => {
  adminApi.get.mockResolvedValue({ status: 'api_authenticated', mapping_status: 'no_products', connected_variants: 0, authorized_shops: 1 });
  await act(async () => root.render(<CjStatusPanel/>));
  await act(async () => host.querySelector('button').click());
  expect(adminApi.get).toHaveBeenCalledWith('integrations/cj/status');
  expect(host.querySelector('[role="status"]').textContent).toContain('Aucune variante liée à CJ');
  expect(host.textContent).not.toContain('expédition validée');
});

test('admin-only zero-euro diagnostic exposes the Stripe link and private order after creation', async () => {
  adminApi.post.mockResolvedValue({ url:'https://checkout.stripe.com/c/pay/cs_fixture', order_reference:'TY-DIAG-1', order_id:'order-fixture', is_test:true, scope:'stripe_order_only' });
  await act(async () => root.render(<ZeroCheckoutDiagnosticPanel/>));
  expect(host.textContent).toContain('aucun panier public, colis, achat fournisseur ni lien CJ');
  await act(async () => host.querySelector('button').click());
  expect(adminApi.post).toHaveBeenCalledWith('diagnostics/zero-checkout', {});
  expect(host.querySelector('a[href="https://checkout.stripe.com/c/pay/cs_fixture"]')).not.toBeNull();
  expect(host.querySelector('a[href="/admin/orders/order-fixture"]')).not.toBeNull();
  expect(host.textContent).toContain('Diagnostic 0 € préparé');
  expect(host.querySelector('button').disabled).toBe(true);
});

test('unauthorized diagnostic cannot expose a checkout link', async () => {
  adminApi.post.mockRejectedValue({ response:{status:403} });
  await act(async () => root.render(<ZeroCheckoutDiagnosticPanel/>));
  await act(async () => host.querySelector('button').click());
  expect(host.querySelector('[role="alert"]').textContent).toContain('Accès réservé aux administrateurs');
  expect(host.querySelector('a[href^="https://checkout.stripe.com/"]')).toBeNull();
});

test('diagnostic rejects an untrusted checkout URL', async () => {
  adminApi.post.mockResolvedValue({ url:'https://example.invalid/pay', order_reference:'TY-DIAG-1', order_id:'order-fixture', is_test:true, scope:'stripe_order_only' });
  await act(async () => root.render(<ZeroCheckoutDiagnosticPanel/>));
  await act(async () => host.querySelector('button').click());
  expect(host.querySelector('[role="alert"]').textContent).toContain('diagnostic reçu est incomplet');
  expect(host.querySelector('a[href^="https://example.invalid/"]')).toBeNull();
});
