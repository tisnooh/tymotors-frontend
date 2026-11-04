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

test('CJ diagnosis names missing shop configuration and lists only authorized shop identifiers', async () => {
  adminApi.get.mockResolvedValue({ status: 'api_authenticated', mapping_status: 'shop_not_configured',
    shops: [{ id: 'shop-1', name: 'TYMotors' }, { id: 'bad/id', name: 'Autre' }] });
  await act(async () => root.render(<CjStatusPanel/>));
  await act(async () => host.querySelector('button').click());
  const status = host.querySelector('[role="status"]').textContent;
  expect(status).toContain('Aucun identifiant de boutique CJ');
  expect(status).toContain('TYMotors · identifiant shop-1');
  expect(status).toContain('aucune sélection automatique');
  expect(status).not.toContain('bad/id');
});

test('CJ shop authorization failure shows bounded provider diagnostics for support', async () => {
  adminApi.get.mockResolvedValue({ status: 'api_authenticated', mapping_status: 'shop_not_authorized',
    shops: [{ id: 'shop-1', name: 'TYMotors' }],
    diagnostics: { stage: 'shops', http_status: 403, code: 1601012, request_id: 'req_abc-123' } });
  await act(async () => root.render(<CjStatusPanel/>));
  await act(async () => host.querySelector('button').click());
  const status = host.querySelector('[role="status"]').textContent;
  expect(status).toContain('n’est pas autorisée');
  expect(status).toContain('lecture des boutiques · HTTP 403 · code CJ 1601012 · requête req_abc-123');
});

test('CJ getShops failure reports the observed unavailable stage without inferring a shop', async () => {
  adminApi.get.mockResolvedValue({ status: 'api_authenticated', mapping_status: 'unavailable',
    diagnostics: { stage: 'shops', http_status: 403, code: 2147483647, request_id: 'req.abc:123' } });
  await act(async () => root.render(<CjStatusPanel/>));
  await act(async () => host.querySelector('button').click());
  const status = host.querySelector('[role="status"]').textContent;
  expect(status).toContain('Liaison des produits CJ impossible à vérifier');
  expect(status).toContain('lecture des boutiques · HTTP 403 · code CJ 2147483647 · requête req.abc:123');
  expect(status).not.toContain('Boutiques autorisées renvoyées');
});

test('CJ status never renders malformed shop names or untrusted diagnostic fields', async () => {
  adminApi.get.mockResolvedValue({ status: 'rejected', mapping_status: 'shop_not_configured',
    shops: [{ id: 'shop-1', name: 'TYMotors' }, { id: 'shop-2', name: '<script>secret</script>' }],
    diagnostics: { stage: '<img>', http_status: '403', code: { secret: true }, request_id: 'key=secret<script>' } });
  await act(async () => root.render(<CjStatusPanel/>));
  await act(async () => host.querySelector('button').click());
  const status = host.querySelector('[role="status"]').textContent;
  expect(status).toContain('Clé CJ refusée');
  expect(status).not.toContain('TYMotors · identifiant');
  expect(status).not.toContain('secret');
  expect(status).not.toContain('Diagnostic CJ');
  expect(host.querySelector('script')).toBeNull();
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
