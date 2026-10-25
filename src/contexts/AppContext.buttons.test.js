import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './AppContext';
import { ProductCard } from '@/components/shared/ProductCard';
import ProductDetail from '@/pages/ProductDetail';
import { Cart, Products } from '@/lib/api';
import { toast } from 'sonner';

const mockNavigate = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null, loading: false }) }));
jest.mock('@/lib/api', () => ({ Cart: { get: jest.fn(), add: jest.fn() },
  Products: { get: jest.fn(), list: jest.fn(), variants: jest.fn(), checkCompatibility: jest.fn() },
  Wishlist: {} }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ slug: 'test-product' }), useNavigate: () => mockNavigate,
  Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), info: jest.fn(), error: jest.fn() } }));

const productId = '10000000-0000-4000-8000-000000000001';
const variantId = '10000000-0000-4000-8000-000000000002';
const secondId = '10000000-0000-4000-8000-000000000003';
const product = { id: productId, slug: 'test-product', name: 'Test only', status: 'active', stock: 2,
  price: 30, currency: 'EUR', images: [], compatibilities: [] };
const variant = id => ({ id, product_id: productId, status: 'active', is_verified: true, sku: id });
const variants = values => ({ product_id: productId, requires_quote: true, variants: values });
let root, host;
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  jest.clearAllMocks(); localStorage.clear();
  host = document.createElement('div'); root = createRoot(host);
  Cart.get.mockResolvedValue({ items: [] }); Cart.add.mockResolvedValue({ items: [{ product_id: productId, variant_id: variantId, quantity: 1 }] });
  Products.get.mockResolvedValue(product); Products.list.mockResolvedValue({ items: [] });
  Products.variants.mockResolvedValue(variants([variant(variantId), variant(secondId)]));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { act(() => root.unmount()); jest.restoreAllMocks(); });
const render = async child => act(async () => root.render(<AppProvider>{child}</AppProvider>));

test('the existing quick-add button does not announce success for ambiguous variants', async () => {
  await render(<ProductCard product={product} />);
  await act(async () => host.querySelector('[data-testid="product-card-add-to-cart-button"]').click());
  expect(Products.variants).toHaveBeenCalledWith(productId);
  expect(Cart.add).not.toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith('Erreur lors de l’ajout');
});
test('the existing product add button does not announce success for an unavailable variant', async () => {
  Products.variants.mockResolvedValue(variants([]));
  await render(<ProductDetail />);
  await act(async () => host.querySelector('[data-testid="product-add-to-cart-button"]').click());
  expect(Cart.add).not.toHaveBeenCalled();
  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalled();
});
test('buy-now does not navigate to checkout after an ambiguous variant refusal', async () => {
  await render(<ProductDetail />);
  const buy = [...host.querySelectorAll('button')].find(button => button.textContent === 'Acheter maintenant');
  await act(async () => buy.click());
  expect(Cart.add).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith('Impossible de préparer la commande');
});
test('the existing quick-add button succeeds only after the exact unique variant was saved', async () => {
  Products.variants.mockResolvedValue(variants([variant(variantId)]));
  await render(<ProductCard product={product} />);
  await act(async () => host.querySelector('[data-testid="product-card-add-to-cart-button"]').click());
  expect(Cart.add).toHaveBeenCalledWith(productId, 1, null, variantId);
  expect(toast.success).toHaveBeenCalledWith('Ajouté au panier');
  expect(toast.error).not.toHaveBeenCalled();
});
test('a server fitment refusal propagates without success even after unique variant discovery', async () => {
  Products.variants.mockResolvedValue(variants([variant(variantId)]));
  Cart.add.mockRejectedValue({ response: { status: 409, data: { detail: 'Compatibility requires verification' } } });
  await render(<ProductCard product={product} />);
  await act(async () => host.querySelector('[data-testid="product-card-add-to-cart-button"]').click());
  expect(Cart.add).toHaveBeenCalledTimes(1);
  expect(toast.success).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalled();
});
