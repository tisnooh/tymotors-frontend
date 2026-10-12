import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductDetail from './ProductDetail';
import { Products } from '@/lib/api';
jest.mock('@/lib/api', () => ({ Products: { get: jest.fn(), list: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ slug: 'fixture' }), useNavigate: () => jest.fn(), Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('@/contexts/AppContext', () => ({ useApp: () => ({ addToCart: jest.fn(), toggleWishlist: jest.fn(), isInWishlist: () => false }) }));
jest.mock('@/components/shared/ProductCard', () => ({ ProductCard: () => null }));
let root, host;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); root = createRoot(host); jest.clearAllMocks(); });
afterEach(() => { act(() => root.unmount()); });
test('product lookup failure is not an endless loading screen', async () => {
  Products.get.mockRejectedValue({ response: { status: 404 } });
  await act(async () => root.render(<ProductDetail/>));
  expect(host.textContent).toContain('Ce produit est introuvable');
  expect(host.querySelector('a').getAttribute('href')).toBe('/shop');
});
test('related lookup failure keeps full product details visible', async () => {
  Products.get.mockResolvedValue({ id: 'fixture', slug: 'fixture', name: 'Pièce test', description: 'Description vérifiée', status: 'active', price: 19.99, stock: 3, images: ['/one.jpg', '/two.jpg'], currency: 'EUR', delivery_estimate: 'Délai test', specs: {}, package_contents: ['Pièce', 'Notice'] });
  Products.list.mockRejectedValue(new Error('offline'));
  await act(async () => root.render(<ProductDetail/>));
  expect(host.querySelector('h1').textContent).toBe('Pièce test');
  expect(host.textContent).toContain('Délai test');
  expect(host.textContent).toContain('Description vérifiée');
  expect(host.querySelector('[data-testid="product-add-to-cart-button"]').disabled).toBe(false);
  act(() => host.querySelectorAll('[data-testid="product-image-thumb"]')[1].click());
  expect(host.querySelector('img').getAttribute('src')).toBe('/two.jpg');
});
