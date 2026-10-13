import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductCard } from './ProductCard';
const mockAdd = jest.fn();
jest.mock('@/contexts/AppContext', () => ({ useApp: () => ({ addToCart: mockAdd, toggleWishlist: jest.fn(), isInWishlist: () => false }) }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), info: jest.fn(), error: jest.fn() } }));
let root, host;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); root = createRoot(host); jest.clearAllMocks(); });
afterEach(() => act(() => root.unmount()));
const draft = { id: 'fixture', slug: 'fixture', name: 'Pièce test', price: 19.99, currency: 'EUR', stock: 0, status: 'draft', images: [] };
test('sandbox card enables quick add and labels test availability', async () => {
  act(() => root.render(<ProductCard product={{ ...draft, test_purchase: true }}/>));
  expect(host.textContent).toContain('Disponible pour les tests');
  const button = host.querySelector('[data-testid="product-card-add-to-cart-button"]');
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(mockAdd).toHaveBeenCalledWith('fixture', 1);
});
test('read-only draft keeps quick add disabled', () => {
  act(() => root.render(<ProductCard product={draft}/>));
  expect(host.querySelector('[data-testid="product-card-add-to-cart-button"]').disabled).toBe(true);
  expect(host.textContent).toContain('Bientôt disponible');
  expect(mockAdd).not.toHaveBeenCalled();
});
