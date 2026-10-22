import { productGallery, productCardPhotos, productPhotoFit } from './productGallery';
import secondPhotos from '@/data/productSecondPhotos.json';
import additions from '@/data/productGalleryAdditions.json';
import legacyPhotos from '@/data/productLegacyFramedPhotos.json';
import catalogueAudit from './__fixtures__/productGalleryAudit.json';
import { productPhoto } from './productPhoto';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

test.each(Object.entries(secondPhotos))('%s replaces only the reviewed second photo', (slug, photo) => {
  const product = { slug, images: ['/main.png', photo.previousImage, '/third.png'] };
  expect(productGallery(product)).toEqual(['/main.png', photo.image, '/third.png', ...(additions[slug] || []).map((p) => p.image)].map(productPhoto));
  expect(product.images[1]).toBe(photo.previousImage);
  expect(photo.sellerPhotoNumber).toBe(2);
  expect(fs.existsSync(path.join(process.cwd(), 'public', photo.image))).toBe(true);
  expect(photo.source).toMatch(/^https:\/\//);
  expect(photo.processing.kind).toBe('ai-background-edit-natural-v2');
  expect(photo.processing.styleReference).toBe('user-approved-w205-v2');
  expect(photo.image).toMatch(/^\/images\/products\/seller-second-natural\//);
  expect(photo.sellerOriginalImage).toBe(`/images/products/seller-second/${slug}.webp`);
  const original = path.join(process.cwd(), 'public', photo.sellerOriginalImage);
  expect(fs.existsSync(original)).toBe(true);
  expect(photo.image).not.toBe(photo.sellerOriginalImage);
  const edited = fs.readFileSync(path.join(process.cwd(), 'public', photo.image));
  expect(createHash('sha256').update(edited).digest('hex')).toBe(photo.sha256);
});

test('the approved natural refresh covers the 30 reviewed seller views', () => {
  expect(Object.keys(secondPhotos)).toHaveLength(30);
  expect(secondPhotos['reverse-cam-hd']).toBeUndefined();
});

test('rejected v1 studio assets are never selected', () => {
  for (const photo of Object.values(secondPhotos)) {
    expect(photo.image).not.toContain('seller-second-studio');
    expect(photo.image).toContain('-natural-v2.webp');
  }
});

test('an image edited in the catalogue is not overridden', () => {
  const slug = Object.keys(secondPhotos)[0];
  const images = ['/main.png', '/newly-edited.png'];
  expect(productGallery({ slug, images })).toBe(images);
});

test('unknown products and incomplete galleries remain untouched', () => {
  const images = ['/main.png', '/second.png'];
  expect(productGallery({ slug: 'unknown', images })).toBe(images);
  const slug = Object.keys(secondPhotos)[0];
  const single = ['/main.png'];
  expect(productGallery({ slug, images: single })).toBe(single);
  expect(productGallery({ slug })).toBeUndefined();
});

test.each(Object.entries(additions))('%s appends every reviewed view without a cap', (slug, photos) => {
  const product = { slug, images: ['/main.png', secondPhotos[slug].previousImage, '/custom-view.png'] };
  const result = productGallery(product);
  expect(result.slice(0, 3)).toEqual(['/main.png', secondPhotos[slug].image, '/custom-view.png'].map(productPhoto));
  expect(result.slice(3)).toEqual(photos.map((p) => productPhoto(p.image)));
  expect(new Set(result).size).toBe(result.length);
  expect(product.images).toHaveLength(3);
  for (const photo of photos) {
    expect(photo.sellerPhotoNumber).toBeGreaterThan(2);
    expect(photo.source).toMatch(/^https:\/\//);
    expect(photo.sourceImage).toMatch(/^https:\/\//);
    expect(photo.review).toBe('visually-compared-to-source');
    expect(photo.processing.tool).toBe('built-in imagegen');
    const edited = fs.readFileSync(path.join(process.cwd(), 'public', photo.image));
    expect(createHash('sha256').update(edited).digest('hex')).toBe(photo.sha256);
    expect(fs.existsSync(path.join(process.cwd(), 'public', photo.sellerOriginalImage))).toBe(true);
    expect(productPhotoFit(photo.image, 7)).toBe('object-contain');
  }
});

test('existing reviewed gallery views are reused rather than appended twice', () => {
  const slug = 'mercedes-w205-rear-spoiler';
  const [photo] = additions[slug];
  const result = productGallery({ slug, images: ['/main.png', secondPhotos[slug].previousImage, photo.sourceImage, photo.image] });
  expect(result.filter((src) => src === photo.image)).toHaveLength(1);
});

test('all additional views are preserved while main and custom photos keep their original fit', () => {
  expect(Object.keys(additions)).toHaveLength(25);
  expect(Object.values(additions).flat()).toHaveLength(85);
  expect(productPhotoFit('/main.png', 0)).toBe('object-cover');
  expect(productPhotoFit('/custom.png', 4)).toBe('object-cover');
  expect(productPhotoFit('/second.png', 1)).toBe('object-contain');
});

test('the three corrected apertures use newly reviewed v2 assets and seller views remain ordered', () => {
  const corrected = ['bmw-g20-mirror-caps--04', 'mercedes-w205-amg-grille--05', 'toyota-supra-diffuser--03'];
  for (const id of corrected) {
    const photo = Object.values(additions).flat().find(p => p.image.includes(id));
    expect(photo.image).toContain('-natural-v2.webp');
    expect(photo.processing.date).toBe('2026-10-21');
  }
  for (const photos of Object.values(additions)) {
    const numbers = photos.map((photo) => photo.sellerPhotoNumber);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  }
});

test.each(Object.entries(legacyPhotos))('%s excludes the framed photo from every gallery position without mutating the catalogue', (slug, photo) => {
  const images = ['/main.png', '/new-seller-view.png', photo.previousImage, '/last-view.png', photo.previousImage];
  const product = { slug, images };
  expect(productGallery(product)).toEqual(['/main.png', '/new-seller-view.png', '/last-view.png']);
  expect(productCardPhotos(product)).toEqual(['/main.png', '/new-seller-view.png']);
  expect(product.images).toEqual(images);
  expect(product.images).toHaveLength(5);
  expect(photo.reason).toContain('Visually reviewed 2026-10-21');
});

test('exclusions follow the exact asset, not the product slug or photo index', () => {
  const photo = legacyPhotos['porsche-911-rear-spoiler'].previousImage;
  expect(productGallery({ slug: 'another-product', images: [photo, '/main.png', photo] })).toEqual(['/main.png']);
  expect(productGallery({ slug: 'porsche-911-rear-spoiler', images: [photo] })).toEqual([]);
  const replaced = ['/main.png', `${photo}?new-version`];
  expect(productGallery({ slug: 'porsche-911-rear-spoiler', images: replaced })).toBe(replaced);
});

test('approved second-view refresh still removes a legacy frame later in its gallery', () => {
  const slug = 'mercedes-w205-rear-spoiler';
  const legacy = legacyPhotos['porsche-911-rear-spoiler'].previousImage;
  const result = productGallery({ slug, images: ['/main.png', secondPhotos[slug].previousImage, legacy] });
  expect(result).toEqual(['/main.png', secondPhotos[slug].image, ...additions[slug].map(photo => photo.image)]);
});

test('the 40-product audit preserves 155 retained views plus the installed Porsche context, excluding ten legacy frames', () => {
  expect(catalogueAudit).toHaveLength(40);
  const excluded = new Set(Object.values(legacyPhotos).map(photo => photo.previousImage));
  let retained = 0;
  let removed = 0;
  for (const product of catalogueAudit) {
    const before = [...product.images];
    const gallery = productGallery(product);
    expect(gallery[0]).toBe(productPhoto(product.images[0]));
    expect(gallery.some(src => excluded.has(src))).toBe(false);
    expect(product.images).toEqual(before);
    retained += gallery.length;
    removed += product.images.filter(src => excluded.has(src)).length;
    const replacement = secondPhotos[product.slug];
    if (replacement) expect(gallery[1]).toBe(productPhoto(replacement.image));
    for (const view of additions[product.slug] || []) expect(gallery).toContain(productPhoto(view.image));
  }
  expect(retained).toBe(156);
  expect(removed).toBe(10);
});
