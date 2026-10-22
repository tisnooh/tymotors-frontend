import { productPhoto, productPhotoContext } from './productPhoto';
import { productGallery } from './productGallery';
import edits from '@/data/productPhotoEdits.json';
import catalogue from './__fixtures__/productGalleryAudit.json';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import imageAudit from '../../docs/product-catalogue-image-audit.json';
import cleanupPrompts from '../../docs/product-presentation-cleanup-prompts.json';
import fidelityRepairs from '../../docs/product-source-fidelity-2026-10-22.json';

test.each(Object.entries(edits))('%s selects its reviewed presentation edit only', (source, edit) => {
  expect(productPhoto(source)).toBe(edit.image);
  expect(productPhoto(`${source}?updated`)).toBe(`${source}?updated`);
  const file = fs.readFileSync(path.join(process.cwd(), 'public', edit.image));
  expect(createHash('sha256').update(file).digest('hex')).toBe(edit.sha256);
  expect(edit.image).toMatch(/^\/images\/products\/(neutral-plates|product-only|presentation-clean|source-fidelity)\/[a-z0-9-]+-v[0-9]+\.webp$/);
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
  expect(selected).toHaveLength(156);
  expect(imageAudit.images.map(({ slug, number, image }) => ({ slug, number, image }))).toEqual(selected);
  expect(imageAudit.images.every(image => image.width > 0 && image.height > 0)).toBe(true);
});

test('each new cleanup selects its saved, hashed asset without dropping or reordering a view', () => {
  expect(cleanupPrompts).toHaveLength(5);
  for (const photo of cleanupPrompts) {
    const current = fidelityRepairs.find(repair => repair.previousImage === photo.previousImage) || photo;
    const reviewed = imageAudit.images.find(image => image.id === photo.id);
    expect(reviewed.slug).toBe(photo.slug);
    expect(reviewed.image).toBe(current.image);
    const historicalFile = fs.readFileSync(path.join(process.cwd(), 'public', photo.image));
    expect(createHash('sha256').update(historicalFile).digest('hex')).toBe(photo.sha256);
    expect(edits[photo.previousImage].sha256).toBe(current.sha256);
    expect(productPhoto(photo.previousImage)).toBe(current.image);
    expect(productPhoto(`${photo.previousImage}?new-version`)).toBe(`${photo.previousImage}?new-version`);
    expect(productGallery(catalogue.find(product => product.slug === photo.slug))[reviewed.number - 1]).toBe(current.image);
    expect(photo.tool).toBe('built-in imagegen');
    expect(photo.review).toBe('visually-compared-to-exact-input');
  }
});

test('all mains show the part while technical supplier validation remains explicitly incomplete', () => {
  expect(imageAudit.status).toBe('incomplete');
  const mains = imageAudit.images.filter(image => image.number === 1);
  expect(mains).toHaveLength(40);
  expect(mains.filter(image => image.mainComposition === 'part-or-complete-kit-only')).toHaveLength(40);
  const porsche = mains.find(image => image.slug === 'porsche-911-rear-spoiler');
  expect(porsche.technicalVerification).toBe(false);
  expect(porsche.sourceComposition).toBe('retouched-visible-assembly-from-mounted-source');
  expect(imageAudit.outstanding.join(' ')).toContain('all six door projectors');
});

test.each(fidelityRepairs)('$slug keeps its sourced repair without claiming physical verification', photo => {
  expect(photo.technicalVerification).toBe(false);
  expect(photo.tool).toBe('built-in imagegen');
  expect(photo.review).toContain('not-technical-validation');
  expect(productPhoto(photo.previousImage)).toBe(photo.image);
  expect(productPhoto(`${photo.previousImage}?future`)).toBe(`${photo.previousImage}?future`);
  const selected = productGallery(catalogue.find(product => product.slug === photo.slug));
  expect(selected[0]).toBe(photo.image);
  const reviewed = imageAudit.images.find(image => image.slug === photo.slug && image.number === 1);
  expect(reviewed.sha256).toBe(photo.sha256);
});

test('Porsche keeps the installed source second without restoring a framed image or overriding future edits', () => {
  const photo = fidelityRepairs.find(photo => photo.slug === 'porsche-911-rear-spoiler');
  const product = catalogue.find(product => product.slug === photo.slug);
  const original = [...product.images];
  expect(productGallery(product)).toEqual([photo.image, photo.contextImage]);
  expect(product.images).toEqual(original);
  expect(productPhotoContext(photo.previousImage)).toBe(photo.contextImage);
  const file = fs.readFileSync(path.join(process.cwd(), 'public', photo.contextImage));
  expect(createHash('sha256').update(file).digest('hex')).toBe(photo.contextSha256);
  expect(productGallery({ ...product, images: [photo.previousImage, photo.contextImage] })).toEqual([photo.image, photo.contextImage]);
  const future = ['/replacement-main.webp', '/replacement-detail.webp'];
  expect(productGallery({ ...product, images: future })).toBe(future);
  expect(productPhotoContext(`${photo.previousImage}?future`)).toBeUndefined();
});
