import { productPhoto } from './productPhoto';
import { productGallery } from './productGallery';
import edits from '@/data/productPhotoEdits.json';
import catalogue from './__fixtures__/productGalleryAudit.json';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import imageAudit from '../../docs/product-catalogue-image-audit.json';
import cleanupPrompts from '../../docs/product-presentation-cleanup-prompts.json';

test.each(Object.entries(edits))('%s selects its verified presentation edit only', (source, edit) => {
  expect(productPhoto(source)).toBe(edit.image);
  expect(productPhoto(`${source}?updated`)).toBe(`${source}?updated`);
  const file = fs.readFileSync(path.join(process.cwd(), 'public', edit.image));
  expect(createHash('sha256').update(file).digest('hex')).toBe(edit.sha256);
  expect(edit.image).toMatch(/^\/images\/products\/(neutral-plates|product-only|presentation-clean)\/[a-z0-9-]+-v[0-9]+\.webp$/);
  expect(edit.width).toBeGreaterThan(0);
  expect(edit.height).toBeGreaterThan(0);
});

test('the Golf retains six views, including its unchanged plate-free close-up', () => {
  const product = catalogue.find(product => product.slug === 'vw-golf7-r-rear-diffuser');
  const before = [...product.images];
  const images = productGallery(product);
  expect(images).toHaveLength(6);
  expect(images[0]).toBe('/images/products/product-only/vw-golf7-r-rear-diffuser-isolated-v1.webp');
  expect(images.filter(src => src.includes('/neutral-plates/'))).toHaveLength(4);
  expect(images[4]).toBe('/images/products/seller-gallery-natural/vw-golf7-r-rear-diffuser--05-natural-v2.webp');
  expect(images.some(src => Boolean(edits[src]))).toBe(false);
  expect(product.images).toEqual(before);
});

test('the main image uses the standalone supplier piece while future catalogue photos remain untouched', () => {
  const product = catalogue.find(product => product.slug === 'vw-golf7-r-rear-diffuser');
  const isolated = productPhoto(product.images[0]);
  expect(isolated).toContain('/product-only/');
  expect(isolated).not.toContain('/neutral-plates/');
  const future = ['/new-main-photo.jpg', '/new-second.jpg'];
  expect(productGallery({ ...product, images: future })).toBe(future);
});

test.each([undefined, null, '', '/unrelated.jpg', 'https://example.com/new-photo.jpg'])('unrelated or missing source %s stays unchanged', source => {
  expect(productPhoto(source)).toBe(source);
});

test('the visual audit covers every current gallery selection, not just the edited products', () => {
  expect(imageAudit.catalogueProducts).toBe(catalogue.length);
  const selected = catalogue.flatMap(product => productGallery(product).map((image, index) => ({
    slug: product.slug, number: index + 1, image,
  })));
  expect(selected).toHaveLength(155);
  expect(imageAudit.images.map(({ slug, number, image }) => ({ slug, number, image }))).toEqual(selected);
  expect(imageAudit.images.every(image => image.width > 0 && image.height > 0)).toBe(true);
});

test('each new cleanup selects its saved, hashed asset without dropping or reordering a view', () => {
  expect(cleanupPrompts).toHaveLength(5);
  for (const photo of cleanupPrompts) {
    const reviewed = imageAudit.images.find(image => image.id === photo.id);
    expect(reviewed.slug).toBe(photo.slug);
    expect(reviewed.image).toBe(photo.image);
    expect(edits[photo.previousImage].sha256).toBe(photo.sha256);
    expect(productPhoto(photo.previousImage)).toBe(photo.image);
    expect(productPhoto(`${photo.previousImage}?new-version`)).toBe(`${photo.previousImage}?new-version`);
    expect(productGallery(catalogue.find(product => product.slug === photo.slug))[reviewed.number - 1]).toBe(photo.image);
    expect(photo.tool).toBe('built-in imagegen');
    expect(photo.review).toBe('visually-compared-to-exact-input');
  }
});

test('the unresolved Porsche standalone presentation is explicitly tracked, never silently approved', () => {
  expect(imageAudit.status).toBe('incomplete');
  const mains = imageAudit.images.filter(image => image.number === 1);
  expect(mains).toHaveLength(40);
  expect(mains.filter(image => image.mainComposition === 'part-or-complete-kit-only')).toHaveLength(39);
  expect(mains.filter(image => image.mainComposition !== 'part-or-complete-kit-only').map(image => image.slug))
    .toEqual(['porsche-911-rear-spoiler']);
});
