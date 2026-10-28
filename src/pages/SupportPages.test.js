import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FAQPage, ShippingPage, TrackPage, ContactPage } from './SupportPages';
import { Tracking, Contact, SiteConfig } from '@/lib/api';
import { useLocation } from 'react-router-dom';

jest.mock('@/lib/api', () => ({ Contact: { send: jest.fn() }, Tracking: { lookup: jest.fn() }, SiteConfig: { get: jest.fn() } }));
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }),
}), { virtual: true });

let container, root;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks();
  useLocation.mockReturnValue({ state: null });
  SiteConfig.get.mockResolvedValue({ legal: {}, legal_ready: false });
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

test('project review prefills contact safely without automatically sending anything', async () => {
  useLocation.mockReturnValue({ state: { customizeRequest: { subject: 'Projet W177', message: 'Classe A W177\nCalandre W177' } } });
  await act(async () => root.render(<ContactPage />));
  expect(container.querySelector('input[name="subject"]')?.value || [...container.querySelectorAll('input')].find(input => input.placeholder === 'Sujet de votre message')?.value).toBe('Projet W177');
  expect(container.querySelector('textarea').value).toContain('Calandre W177');
  expect(Contact.send).not.toHaveBeenCalled();
});

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

test('tracking displays the carrier and tracking number even without a URL', async () => {
  Tracking.lookup.mockResolvedValue({ order_number: 'TY-TEST', fulfillment_status: 'shipped',
    carrier: 'Transporteur test', tracking_number: 'TRACK-123',
    tracking_events: [{ id: 'event', title: 'Expédiée', occurred_at: 'invalid-date' }] });
  await searchTracking();
  expect(container.textContent).toContain('Transporteur test');
  expect(container.textContent).toContain('TRACK-123');
  expect(container.querySelector('time')).toBeNull();
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
test('shipping and FAQ never advertise legacy tariffs or unverified EU availability', async () => {
  await act(async () => root.render(<ShippingPage />));
  expect(container.textContent).not.toContain('15 €'); expect(container.textContent).not.toContain('350');
  expect(container.textContent).not.toContain('Belgique'); expect(container.textContent).not.toContain('toute l’Europe');
  expect(container.textContent).toContain('France'); expect(container.textContent).toContain('Aucun seuil de gratuité garanti');
  await act(async () => root.render(<FAQPage />));
  await act(async () => { for (const button of container.querySelectorAll('button')) button.click(); });
  expect(container.textContent).not.toContain('350'); expect(container.textContent).toContain('Leur montant est indiqué avant le paiement');
  expect(container.textContent).toContain('compatibilité non confirmée');
});
test('contact uses the same server legal coordinates as legal pages', async () => {
  SiteConfig.get.mockResolvedValue({ legal: { contact_email: 'contact@example.test', contact_phone: '+33 TEST', address: 'Adresse fictive de test' } });
  await act(async () => root.render(<ContactPage />));
  expect(container.textContent).toContain('contact@example.test'); expect(container.textContent).toContain('Adresse fictive de test');
  expect(Contact.send).not.toHaveBeenCalled();
});
test('missing contact coordinates remain explicit without a fabricated service response deadline', async () => {
  await act(async () => root.render(<ContactPage />));
  expect(container.textContent).toContain('Les coordonnées de contact seront publiées avant l’ouverture');
  expect(container.textContent).not.toContain('24h'); expect(container.textContent).not.toContain('48h');
});
test('an offline legal configuration does not break the contact form or expose its error', async () => {
  SiteConfig.get.mockRejectedValue(new Error('private configuration trace'));
  Contact.send.mockResolvedValue({ accepted: true });
  await act(async () => root.render(<ContactPage />));
  expect(container.textContent).toContain('Les coordonnées de contact seront publiées');
  expect(container.textContent).not.toContain('private configuration trace');
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(Contact.send).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain('Demande enregistrée');
  expect(container.textContent).not.toContain('Message envoyé');
});
test('malformed or private configuration is never displayed as a contact address', async () => {
  SiteConfig.get.mockResolvedValue({ secret: 'private-example', legal: { contact_email: { secret: 'private-example' }, private_key: 'private-example' } });
  await act(async () => root.render(<ContactPage />));
  expect(container.textContent).toContain('Les coordonnées de contact seront publiées avant l’ouverture');
  expect(container.textContent).not.toContain('private-example');
  expect(container.textContent).not.toContain('[object Object]');
});
