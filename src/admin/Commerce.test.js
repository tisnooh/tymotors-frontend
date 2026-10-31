import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { OrderDetail } from './Commerce';
import { useData } from './ui';
import { adminApi } from './api';
import { toast } from 'sonner';

jest.mock('@/lib/api', () => ({ api: {} }));
jest.mock('./api', () => ({ ...jest.requireActual('./api'), adminApi: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
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

test.each(['stripe_profile_ref', 'commerce_quote_id'])('context %s hides legacy global and supplier writes', async field => {
  order[field] = 'context-fixture'; await act(async () => root.render(<OrderDetail />));
  expect(host.textContent).toContain('Aucun dossier fournisseur enregistré');
  expect(host.textContent).not.toContain('Enregistrer l’étape');
  expect(host.querySelector('select')).toBeNull();
  expect(useData).toHaveBeenCalledWith('commerce/context/orders/fixture/tasks');
  expect(adminApi.put).not.toHaveBeenCalled();
  expect(toast.error).not.toHaveBeenCalled();
});

test('sandbox context task cannot open a supplier draft or advance a parcel', async () => {
  order.is_test = true;
  order.stripe_profile_ref = 'sandbox-profile';
  const task = { id: 'task-1', order_id: order.id, is_test: true,
    state: 'requires_review', updated_at: order.updated_at, supplier_sku: 'SKU-1',
    quantity: 1, snapshot: {}, review_reasons: [], supplier_id: 'supplier-1', agent_id: 'agent-1' };
  useData.mockImplementation(path => ({ data: path.includes('/tasks') ? { items: [task] } : order,
    loading: false, reload: jest.fn() }));
  await act(async () => root.render(<OrderDetail />));
  expect(host.textContent).toContain('Commande de test : aucune confirmation fournisseur');
  expect(host.textContent).not.toContain('Préparer le dossier fournisseur sans envoi');
  const advance = [...host.querySelectorAll('button')].find(b => b.textContent.includes('Confirmer la référence'));
  expect(advance.disabled).toBe(true);
  expect(adminApi.get).not.toHaveBeenCalled();
  expect(adminApi.post).not.toHaveBeenCalled();
  expect(adminApi.put).not.toHaveBeenCalled();
});

test('production supplier draft stays read only and shows its transmission limit', async () => {
  order.is_test = false;
  order.stripe_profile_ref = 'production-profile';
  const task = { id: 'task-2', order_id: order.id, is_test: false,
    state: 'requires_review', updated_at: order.updated_at, supplier_sku: 'SKU-2',
    quantity: 1, snapshot: {}, review_reasons: [], supplier_id: 'supplier-2', agent_id: 'agent-2' };
  useData.mockImplementation(path => ({ data: path.includes('/tasks') ? { items: [task] } : order,
    loading: false, reload: jest.fn() }));
  adminApi.get.mockResolvedValue({ task_id: task.id, order_id: order.id,
    status: 'draft_not_transmitted', external_send_allowed: false, supplier_sku: 'SKU-2' });
  await act(async () => root.render(<OrderDetail />));
  const draft = [...host.querySelectorAll('button')].find(b => b.textContent.includes('Préparer le dossier'));
  await act(async () => draft.click());
  expect(adminApi.get).toHaveBeenCalledWith('commerce/context/tasks/task-2/supplier-draft');
  expect(host.textContent).toContain('Brouillon non transmis');
  expect(adminApi.post).not.toHaveBeenCalled();
});

test('each shipment advances its own task with CAS, carrier, tracking and evidence', async () => {
  order.is_test = false;
  order.stripe_profile_ref = 'production-profile';
  order.stock_applied_at = order.updated_at;
  order.requires_compatibility_review = false;
  const task = { id: 'task-3', order_id: order.id, is_test: false,
    state: 'supplier_confirmed', updated_at: order.updated_at, supplier_sku: 'SKU-3',
    supplier_order_ref: 'supplier-order-3', quantity: 1, snapshot: {}, review_reasons: [],
    supplier_id: 'supplier-3', agent_id: 'agent-3' };
  useData.mockImplementation(path => ({ data: path.includes('/tasks') ? { items: [task] } : order,
    loading: false, reload: jest.fn() }));
  adminApi.post.mockResolvedValue({ task_id: task.id, order_id: order.id,
    task_state: 'shipped', updated: true });
  await act(async () => root.render(<OrderDetail />));
  async function fill(label, value) {
    const field = [...host.querySelectorAll('label')].find(node => node.textContent.includes(label));
    const input = field.querySelector('input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  await fill('Transporteur du colis', 'DHL');
  await fill('Numéro de suivi du colis', 'REAL-123');
  await fill('Lien HTTPS de suivi du colis', 'https://example.com/track/REAL-123');
  await fill('Preuve d’expédition du colis', 'Dossier transporteur réel');
  const form = [...host.querySelectorAll('form')].find(node => node.textContent.includes('Enregistrer l’expédition'));
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(adminApi.post).toHaveBeenCalledWith('commerce/context/tasks/task-3/advance', {
    expected_updated_at: order.updated_at, next: 'shipped', evidence_ref: 'Dossier transporteur réel',
    supplier_order_ref: null, tracking_number: 'REAL-123', carrier: 'DHL',
    tracking_url: 'https://example.com/track/REAL-123',
  });
  expect(adminApi.put).not.toHaveBeenCalled();
});
