import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductCard } from './ProductCard';
import secondPhotos from '@/data/productSecondPhotos.json';
import unreviewedPhotos from '@/data/productLegacyFramedPhotos.json';
import { productGallery } from '@/lib/productGallery';
import { productPhoto } from '@/lib/productPhoto';
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
test('active item stays non-purchasable when the server has closed checkout', () => {
  act(() => root.render(<ProductCard product={{ ...draft, status: 'active', stock: 3, purchase_available: false }}/>));
  expect(host.querySelector('[data-testid="product-card-add-to-cart-button"]').disabled).toBe(true);
  expect(host.textContent).toContain('Indisponible');
  expect(mockAdd).not.toHaveBeenCalled();
});

test.each(Object.entries(secondPhotos))('%s uses the approved second photo in the presentation card too', (slug, photo) => {
  const images = ['/unchanged-main.jpg', photo.previousImage];
  const product = { ...draft, slug, images };
  act(() => root.render(<ProductCard product={product}/>));
  const rendered = host.querySelectorAll('img');
  expect(host.querySelector('[data-testid="product-card-image-frame"]').className).toContain('aspect-square');
  expect(rendered).toHaveLength(2);
  expect(rendered[0].getAttribute('src')).toBe(images[0]);
  expect(rendered[1].getAttribute('src')).toBe(productPhoto(photo.image));
  for (const image of rendered) {
    expect(image.className).toContain('object-contain');
    expect(image.className).not.toContain('object-cover');
    expect(image.className).not.toContain('scale-');
  }
  expect(rendered[0].className).toContain('group-hover:opacity-0');
  expect(rendered[1].className).toContain('group-hover:opacity-100');
  expect(rendered[1].getAttribute('aria-hidden')).toBe('true');
  expect(host.querySelector('[data-testid="product-card"]').getAttribute('href')).toBe(`/product/${slug}`);
  expect(product.images).toEqual(['/unchanged-main.jpg', photo.previousImage]);
  expect(host.querySelector('[data-testid="product-card-add-to-cart-button"]').disabled).toBe(true);
});

test('a later catalogue photo is never overridden in a card', () => {
  const slug = 'mercedes-w177-amg-side-vents';
  const images = ['/main.jpg', '/new-catalogue-photo.jpg'];
  act(() => root.render(<ProductCard product={{ ...draft, slug, images }}/>));
  expect([...host.querySelectorAll('img')].map(image => image.getAttribute('src'))).toEqual(images);
});

test('a product with only one photo stays visible on hover', () => {
  act(() => root.render(<ProductCard product={{ ...draft, images: ['/single.jpg'] }}/>));
  const images = host.querySelectorAll('img');
  expect(images).toHaveLength(1);
  expect(images[0].className).not.toContain('group-hover:opacity-0');
});

test.each(Object.entries(unreviewedPhotos))('%s retains the main presentation instead of the unreviewed hover photo', (slug, photo) => {
  const images = ['/unchanged-main.jpg', photo.previousImage];
  const product = { ...draft, slug, images };
  act(() => root.render(<ProductCard product={product}/>));
  const rendered = host.querySelectorAll('img');
  expect(host.querySelector('[data-testid="product-card-image-frame"]').className).toContain('aspect-square');
  expect(rendered).toHaveLength(1);
  expect(rendered[0].getAttribute('src')).toBe(images[0]);
  expect(rendered[0].className).toContain('object-contain');
  expect(rendered[0].className).not.toContain('group-hover:opacity-0');
  expect(productGallery(product)).toEqual(['/unchanged-main.jpg']);
  expect(product.images).toEqual(['/unchanged-main.jpg', photo.previousImage]);
  expect(host.querySelector('[data-testid="product-card"]').getAttribute('href')).toBe(`/product/${slug}`);
});

test.each(Object.keys(unreviewedPhotos))('%s permits a later replacement photo instead of permanently disabling hover', slug => {
  const images = ['/main.jpg', '/new-reviewed-catalogue-photo.jpg'];
  act(() => root.render(<ProductCard product={{ ...draft, slug, images }}/>));
  expect([...host.querySelectorAll('img')].map(image => image.getAttribute('src'))).toEqual(images);
});

test('all 40 current product presentations are explicitly covered without overlapping selections', () => {
  expect(Object.keys(secondPhotos)).toHaveLength(30);
  expect(Object.keys(unreviewedPhotos)).toHaveLength(10);
  expect(new Set([...Object.keys(secondPhotos), ...Object.keys(unreviewedPhotos)]).size).toBe(40);
});

test.each([[800, 800, false], [600, 900, true], [1200, 800, true]])('a %sx%s card photo fills the edges without cropping the product', (width, height, backdrop) => {
  act(() => root.render(<ProductCard product={{ ...draft, images: ['/actual-photo.jpg', '/other-view.jpg'] }}/>));
  expect(host.querySelector('[data-testid="photo-backdrop"]')).toBeNull();
  const img = host.querySelector('img');
  Object.defineProperties(img, { naturalWidth: { value: width }, naturalHeight: { value: height } });
  act(() => img.dispatchEvent(new Event('load')));
  expect(Boolean(host.querySelector('[data-testid="photo-backdrop"]'))).toBe(backdrop);
  expect(host.querySelectorAll('img')).toHaveLength(2);
  expect(img.className).toContain('object-contain');
  if (backdrop) {
    const edge = host.querySelector('[data-testid="photo-backdrop"]');
    expect(edge.getAttribute('aria-hidden')).toBe('true');
    expect(edge.className).toContain('group-hover:opacity-0');
    expect(edge.firstChild.style.backgroundImage).toContain('/actual-photo.jpg');
  }
});

test('hover edge fill follows the same second photo and does not replace the main source', () => {
  act(() => root.render(<ProductCard product={{ ...draft, images: ['/main.jpg', '/portrait.jpg'] }}/>));
  const photo = host.querySelectorAll('img')[1];
  Object.defineProperties(photo, { naturalWidth: { value: 600 }, naturalHeight: { value: 900 } });
  act(() => photo.dispatchEvent(new Event('load')));
  const edge = host.querySelector('[data-testid="photo-backdrop"]');
  expect(edge.className).toContain('opacity-0 group-hover:opacity-100');
  expect(edge.firstChild.style.backgroundImage).toContain('/portrait.jpg');
  expect(host.querySelector('img').getAttribute('src')).toBe('/main.jpg');
});
