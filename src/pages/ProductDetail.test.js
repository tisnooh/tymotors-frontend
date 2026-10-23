import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductDetail from './ProductDetail';
import { Products } from '@/lib/api';
import secondPhotos from '@/data/productSecondPhotos.json';
import legacyPhotos from '@/data/productLegacyFramedPhotos.json';
import catalogueAudit from '@/lib/__fixtures__/productGalleryAudit.json';
import { productGallery } from '@/lib/productGallery';
import { productPhoto } from '@/lib/productPhoto';
jest.mock('@/lib/api', () => ({ Products: { get: jest.fn(), list: jest.fn(), checkCompatibility: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ slug: 'fixture' }), useNavigate: () => jest.fn(), Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'fr' } }) }));
jest.mock('@/contexts/AppContext', () => ({ useApp: () => ({ addToCart: jest.fn(), toggleWishlist: jest.fn(), isInWishlist: () => false }) }));
jest.mock('@/components/shared/ProductCard', () => ({ ProductCard: () => null }));
let root, host;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); root = createRoot(host); jest.clearAllMocks(); });
afterEach(() => { act(() => root.unmount()); });

test('seller photo 2 changes without replacing the first product photo', async () => {
  const slug = 'mercedes-w205-rear-spoiler';
  const replacement = secondPhotos[slug];
  Products.get.mockResolvedValue({ id: slug, slug, name: 'Spoiler W205', description: 'Description', status: 'draft', price: 139, stock: 0, images: ['/unchanged-main.png', replacement.previousImage], currency: 'EUR', specs: {} });
  Products.list.mockResolvedValue({ items: [] });
  await act(async () => root.render(<ProductDetail/>));
  const thumbs = host.querySelectorAll('[data-testid="product-image-thumb"]');
  expect(host.querySelector('[data-testid="product-gallery-image-frame"]').className).toContain('aspect-square');
  expect(host.querySelector('img').className).toContain('object-contain');
  expect(thumbs[0].querySelector('img').getAttribute('src')).toBe('/unchanged-main.png');
  expect(thumbs[1].querySelector('img').getAttribute('src')).toBe(replacement.image);
  act(() => thumbs[1].click());
  const selected = host.querySelector('img[alt="Spoiler W205 — photo 2"]');
  expect(selected.getAttribute('src')).toBe(replacement.image);
  expect(selected.className).toContain('object-contain');
  expect(host.querySelector('[data-testid="product-add-to-cart-button"]').disabled).toBe(true);
  expect(thumbs.length).toBe(9);
  act(() => thumbs[8].click());
  const last = host.querySelector('img[alt="Spoiler W205 — photo 9"]');
  expect(last.getAttribute('src')).toContain('/seller-gallery-natural/mercedes-w205-rear-spoiler--09');
  expect(last.className).toContain('object-contain');
  expect(thumbs[8].getAttribute('aria-pressed')).toBe('true');
});
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
test('sandbox draft can be added without claiming real stock', async () => {
  Products.get.mockResolvedValue({ id: 'fixture', name: 'Pièce test', status: 'draft', test_purchase: true, max_order_quantity: 20, stock: 0, price: 19.99, images: [], currency: 'EUR' });
  Products.list.mockResolvedValue({ items: [] });
  await act(async () => root.render(<ProductDetail/>));
  expect(host.textContent).toContain('Disponible pour les tests');
  expect(host.textContent).toContain('aucun débit réel ni expédition');
  expect(host.textContent).not.toContain('Bientôt disponible');
  expect(host.querySelector('[data-testid="product-add-to-cart-button"]').disabled).toBe(false);
  const plus = host.querySelector('[aria-label="Augmenter la quantité"]');
  expect(plus.disabled).toBe(false);
  act(() => plus.click());
  expect(host.querySelector('[data-testid="product-qty"]').textContent).toBe('2');
});
test('draft remains disabled when sandbox availability is not granted by API', async () => {
  Products.get.mockResolvedValue({ id: 'fixture', name: 'Pièce test', status: 'draft', stock: 0, price: 19.99, images: [], currency: 'EUR' });
  Products.list.mockResolvedValue({ items: [] });
  await act(async () => root.render(<ProductDetail/>));
  expect(host.querySelector('[data-testid="product-add-to-cart-button"]').disabled).toBe(true);
  expect(host.textContent).toContain('Bientôt disponible');
});

const setField = (label, value) => act(() => {
  const element = host.querySelector(`[aria-label="${label}"]`);
  const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.dispatchEvent(new Event('change', { bubbles: true }));
  if (element.tagName === 'INPUT') element.dispatchEvent(new Event('input', { bubbles: true }));
});

async function renderFitmentFixture() {
  Products.get.mockResolvedValue({ id: 'fixture', slug: 'fixture', name: 'Pièce test', description: 'Montage à confirmer', status: 'draft', test_purchase: true, max_order_quantity: 20, stock: 0, price: 99, images: [], currency: 'EUR', compatible_brands: ['bmw'], compatibilities: [{
    brand_slug: 'bmw', model: 'Série 3', chassis: 'F30', year_from: 2013, year_to: 2019,
    body_types: ['Berline'], required_trim: ['M Sport'], excluded_trims: [],
    facelift: 'lci', camera_compatible: false, parking_sensor_compatible: true, is_verified: false,
  }] });
  Products.list.mockResolvedValue({ items: [] });
  await act(async () => root.render(<ProductDetail/>));
  setField('Marque du véhicule', 'bmw');
  setField('Modèle du véhicule', 'Série 3');
  setField('Châssis du véhicule', 'F30');
}

test('collects constrained vehicle details without claiming brand-wide fitment', async () => {
  await renderFitmentFixture();
  expect(host.textContent).toContain('Marques concernées');
  expect(host.textContent).toContain('ne constituent pas une compatibilité avec tous leurs modèles');
  setField('Année du véhicule', '2016');
  setField('Carrosserie du véhicule', 'Berline');
  setField('Finition du véhicule', 'M Sport');
  setField('Phase du véhicule', 'lci');
  setField('Caméra du véhicule', 'no');
  setField('Capteurs de stationnement', 'yes');
  Products.checkCompatibility.mockResolvedValue({ status: 'confirm', reason: 'Référence à confirmer' });
  await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent.includes('Vérifier la compatibilité')).click());
  expect(Products.checkCompatibility).toHaveBeenCalledWith('fixture', expect.objectContaining({
    year: 2016, chassis: 'F30', body_type: 'Berline', trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: true,
  }));
  expect(host.textContent).toContain('Compatibilité à confirmer');
});

test('does not apply a late compatible response after the vehicle selection changes', async () => {
  await renderFitmentFixture();
  let resolve;
  Products.checkCompatibility.mockImplementation(() => new Promise(done => { resolve = done; }));
  act(() => [...host.querySelectorAll('button')].find(button => button.textContent.includes('Vérifier la compatibilité')).click());
  setField('Châssis du véhicule', '');
  await act(async () => resolve({ status: 'compatible', reason: 'STALE FITMENT RESPONSE' }));
  expect(host.textContent).not.toContain('STALE FITMENT RESPONSE');
  expect(host.querySelector('[data-testid="product-add-to-cart-button"]').disabled).toBe(true);
});

test.each(catalogueAudit.map(product => [product.slug, product]))('%s renders only retained photos throughout the detail gallery', async (slug, product) => {
  Products.get.mockResolvedValue({ ...product, id: slug, name: slug, price: 99, stock: 0, status: 'draft', currency: 'EUR', specs: {} });
  Products.list.mockResolvedValue({ items: [] });
  await act(async () => root.render(<ProductDetail/>));
  const gallery = productGallery(product);
  expect(host.querySelector('img').getAttribute('src')).toBe(productPhoto(product.images[0]));
  expect(document.head.querySelector('meta[property="og:image"]').getAttribute('content'))
    .toBe(new URL(gallery[0], window.location.origin).href);
  const schema = JSON.parse(document.head.querySelector('script[data-tymotors-product="true"]').textContent);
  expect(schema.image).toEqual(gallery.map(photo => new URL(photo, window.location.origin).href));
  const thumbs = [...host.querySelectorAll('[data-testid="product-image-thumb"]')];
  expect(thumbs).toHaveLength(gallery.length > 1 ? gallery.length : 0);
  for (const [index, thumb] of thumbs.entries()) {
    expect(thumb.querySelector('img').getAttribute('src')).toBe(gallery[index]);
    act(() => thumb.click());
    expect(host.querySelector('img').getAttribute('src')).toBe(gallery[index]);
  }
  const legacy = legacyPhotos[slug]?.previousImage;
  expect([...host.querySelectorAll('img')].some(image => image.getAttribute('src') === legacy)).toBe(false);
});
