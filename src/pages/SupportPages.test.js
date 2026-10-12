import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FAQPage, ShippingPage, TrackPage } from './SupportPages';
import { Tracking } from '@/lib/api';

jest.mock('@/lib/api', () => ({ Contact: { send: jest.fn() }, Tracking: { lookup: jest.fn() } }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }),
}), { virtual: true });

let container, root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function searchTracking() {
  await act(async () => root.render(<TrackPage />));
  await act(async () => {
    container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

test.each([
  ['unfulfilled', 'Commande reçue'],
  ['requires_review', 'Vérification en cours'],
  ['processing', 'En préparation'],
  ['shipped', 'Expédiée'],
  ['delivered', 'Livrée'],
  ['cancelled', 'Annulée'],
  ['future_status', 'Suivi en cours'],
])('tracking status %s has a customer-facing label', async (status, label) => {
  Tracking.lookup.mockResolvedValue({ order_number: 'TY-TEST', fulfillment_status: status, tracking_events: [] });
  await searchTracking();
  expect(container.textContent).toContain(label);
  expect(container.textContent).not.toContain(status);
});

test('a temporary outage is not presented as a missing order', async () => {
  Tracking.lookup.mockRejectedValue({ response: { status: 503 } });
  await searchTracking();
  expect(container.textContent).toContain('Suivi indisponible');
  expect(container.textContent).not.toContain('Commande introuvable');
});

test('an unmatched order keeps a generic lookup error', async () => {
  Tracking.lookup.mockRejectedValue({ response: { status: 404 } });
  await searchTracking();
  expect(container.textContent).toContain('Commande introuvable');
});

test('shipping copy does not promise unconfirmed same-day dispatch', async () => {
  await act(async () => root.render(<ShippingPage />));
  expect(container.textContent).toContain('confirmés avant la commande');
  expect(container.textContent).not.toContain('avant 14h');
  expect(container.textContent).not.toContain('après expédition');
});

test('FAQ does not promise express delivery or interest-free installments', async () => {
  await act(async () => root.render(<FAQPage />));
  await act(async () => {
    for (const button of container.querySelectorAll('button')) button.click();
  });
  expect(container.textContent).not.toContain('2-3 jours');
  expect(container.textContent).not.toContain('3 ou 4 fois sans frais');
  expect(container.textContent).toContain('conditions et frais');
});
