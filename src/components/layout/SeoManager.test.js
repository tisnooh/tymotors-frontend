import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useLocation } from 'react-router-dom';
jest.mock('react-router-dom', () => ({ useLocation: jest.fn() }), { virtual: true });
// Verify private noindex even in a future production site, without enabling Stripe.
process.env.REACT_APP_SITE_MODE = 'production';
delete process.env.REACT_APP_SITE_URL;
const { SeoManager } = require('./SeoManager');
let root, host;
beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); root = createRoot(host); });
afterEach(() => act(() => root.unmount()));

test.each([
  ['/support/track', 'Suivi de commande'], ['/cart', 'Votre panier'], ['/order-success', 'Confirmation de commande'],
  ['/account/orders/fixture', 'Votre compte'], ['/auth', 'Connexion'], ['/auth/reset', 'Nouveau mot de passe'],
  ['/auth/confirm', 'Confirmation de compte'], ['/reset-password', 'Nouveau mot de passe'],
  ['/newsletter/confirm', 'Confirmation d’inscription'], ['/newsletter/unsubscribe', 'Préférences email'],
  ['/admin/orders', 'Administration'],
])('private route %s has a correct title and noindex', (pathname, title) => {
  useLocation.mockReturnValue({ pathname, search: '?token=not_a_real_credential' });
  act(() => root.render(<SeoManager />));
  expect(document.title).toContain(title);
  expect(document.head.querySelector('meta[name="robots"]').content).toBe('noindex,nofollow');
  const canonical = document.head.querySelector('link[rel="canonical"]').href;
  expect(canonical).toBe(window.location.origin + pathname);
  expect(canonical).not.toContain('token=');
});

test.each(['/legal/mentions', '/legal/withdrawal', '/legal/photo-credits'])('valid legal route %s is not mislabeled missing', pathname => {
  useLocation.mockReturnValue({ pathname });
  act(() => root.render(<SeoManager />));
  expect(document.title).not.toContain('introuvable');
  expect(document.head.querySelector('meta[name="robots"]').content).toContain('index,follow');
});
