/* global global */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CjDraftPanel } from './Commerce';
import { adminApi } from './api';

jest.mock('@/lib/api', () => ({ api: {} }));
jest.mock('./api', () => ({ ...jest.requireActual('./api'), adminApi: { get: jest.fn(), post: jest.fn() } }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }),
  useParams: () => ({ id: 'order-1' }), useSearchParams: () => [new URLSearchParams()],
}), { virtual: true });

let host, root;
const preview = {
  scope: 'unpaid_cj_draft', can_submit_draft: true, blockers: [], warnings: [],
  expected_updated_at: '2026-11-03T18:00:00+00:00', fingerprint: 'a'.repeat(64),
  payload: { orderNumber: 'TY-ORDER-1', storeName: 'TYMotors',
    fromCountryCode: 'CN', logisticName: 'CJPacket', products: [{ vid: 'CJ-1' }] },
};
const submission = { state: 'submitted', cj_order_id: 'CJ-ORDER-1', cj_shop_id: 'shop-1' };
const button = label => [...host.querySelectorAll('button')].find(b => b.textContent.includes(label));

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks();
  host = document.createElement('div'); root = createRoot(host);
});
afterEach(() => act(() => root.unmount()));

test('GET is manual and blocked preview cannot create a CJ draft', async () => {
  adminApi.get.mockResolvedValue({ ...preview, can_submit_draft: false,
    blockers: [{ code: 'supplier_approval_evidence_required', order_item_id: 'item-1' }], payload: null });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  expect(adminApi.get).not.toHaveBeenCalled();
  await act(async () => button('Vérifier le brouillon CJ').click());
  expect(adminApi.get).toHaveBeenCalledWith('orders/order-1/cj-draft');
  expect(host.textContent).toContain('approbation fournisseur');
  expect(host.textContent).toContain('ligne item-1');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
  expect(adminApi.post).not.toHaveBeenCalled();
});

test('admin access failure exposes no draft action or provider data', async () => {
  adminApi.get.mockRejectedValue({ response: { status: 403 } });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  await act(async () => button('Vérifier le brouillon CJ').click());
  expect(host.querySelector('[role="alert"]').textContent).toContain('Accès réservé aux administrateurs');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
  expect(adminApi.post).not.toHaveBeenCalled();
});

test('malformed readiness cannot arm an action or silently no-op', async () => {
  adminApi.get.mockResolvedValueOnce({ ...preview, fingerprint: null, warnings: null })
    .mockResolvedValueOnce({ ...preview, blockers: [null] });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  await act(async () => button('Vérifier le brouillon CJ').click());
  expect(host.querySelector('[role="alert"]').textContent).toContain('Réponse CJ incomplète');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
  await act(async () => button('Vérifier le brouillon CJ').click());
  expect(host.querySelector('[role="alert"]').textContent).toContain('Réponse CJ incomplète');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
  expect(adminApi.post).not.toHaveBeenCalled();
});

test('explicit operator confirmation sends the version and fingerprint exactly once', async () => {
  adminApi.get.mockResolvedValue(preview);
  adminApi.post.mockResolvedValue({ reused: false, supplier_payment: 'not_initiated', submission });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  await act(async () => button('Vérifier le brouillon CJ').click());
  expect(button('Créer le brouillon CJ').disabled).toBe(true);
  const check = host.querySelector('input[type="checkbox"]');
  await act(async () => check.click());
  expect(button('Créer le brouillon CJ').disabled).toBe(false);
  await act(async () => button('Créer le brouillon CJ').click());
  expect(adminApi.post).toHaveBeenCalledTimes(1);
  expect(adminApi.post).toHaveBeenCalledWith('orders/order-1/cj-draft', {
    expected_updated_at: preview.expected_updated_at, fingerprint: preview.fingerprint,
    confirm_create_unpaid_draft: true,
  });
  expect(host.textContent).toContain('sans paiement fournisseur');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
});

test('existing uncertain submission never offers retry or CJ status sync', async () => {
  adminApi.get.mockResolvedValue({ scope: 'unpaid_cj_draft', can_submit_draft: false,
    submission: { state: 'uncertain', cj_order_id: null, request_id: 'CJ-REQUEST-1' }, blockers: [], warnings: [] });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  await act(async () => button('Vérifier le brouillon CJ').click());
  expect(host.textContent).toContain('Aucun renvoi automatique');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
  expect(button('Actualiser le statut CJ')).toBeUndefined();
  expect(adminApi.post).not.toHaveBeenCalled();
});

test('failed POST discards stale preview and requires a fresh server check', async () => {
  adminApi.get.mockResolvedValue(preview);
  adminApi.post.mockRejectedValue({ response: { status: 409, data: { detail: 'Dossier modifié' } } });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  await act(async () => button('Vérifier le brouillon CJ').click());
  const check = host.querySelector('input[type="checkbox"]');
  await act(async () => check.click());
  await act(async () => button('Créer le brouillon CJ').click());
  expect(host.querySelector('[role="alert"]').textContent).toContain('ne renvoyez pas');
  expect(button('Créer le brouillon CJ')).toBeUndefined();
  expect(adminApi.post).toHaveBeenCalledTimes(1);
});

test('submitted draft can be queried but never marks client tracking as updated', async () => {
  adminApi.get.mockResolvedValue({ scope: 'unpaid_cj_draft', can_submit_draft: false, submission,
    blockers: [], warnings: [] });
  adminApi.post.mockResolvedValue({ customer_tracking_updated: false, submission: {
    ...submission, observation: { order_status: 'CREATED', order_number: 'TY-ORDER-1', tracking_number: null },
  } });
  await act(async () => root.render(<CjDraftPanel orderId="order-1"/>));
  await act(async () => button('Vérifier le brouillon CJ').click());
  await act(async () => button('Actualiser le statut CJ').click());
  expect(adminApi.post).toHaveBeenCalledWith('orders/order-1/cj-sync', {});
  expect(host.textContent).toContain('Le suivi client n’est pas mis à jour automatiquement');
  expect(host.textContent).toContain('ne marque pas la commande comme expédiée');
});
