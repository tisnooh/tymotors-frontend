import { productGallery } from './productGallery';
import secondPhotos from '@/data/productSecondPhotos.json';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

test.each(Object.entries(secondPhotos))('%s replaces only the reviewed second photo', (slug, photo) => {
  const product = { slug, images: ['/main.png', photo.previousImage, '/third.png'] };
  expect(productGallery(product)).toEqual(['/main.png', photo.image, '/third.png']);
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

test('the approved natural refresh covers only the 29 reviewed seller views', () => {
  expect(Object.keys(secondPhotos)).toHaveLength(29);
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
