import { productPhoto } from './productPhoto';
import { productGallery } from './productGallery';
import edits from '@/data/productPhotoEdits.json';
import catalogue from './__fixtures__/productGalleryAudit.json';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

test.each(Object.entries(edits))('%s selects its verified presentation edit only', (source, edit) => {
  expect(productPhoto(source)).toBe(edit.image);
  expect(productPhoto(`${source}?updated`)).toBe(`${source}?updated`);
  const file = fs.readFileSync(path.join(process.cwd(), 'public', edit.image));
  expect(createHash('sha256').update(file).digest('hex')).toBe(edit.sha256);
  expect(edit.image).toMatch(/^\/images\/products\/(neutral-plates\/vw-golf7-r-rear-diffuser--0[2346]-neutral-v1|product-only\/vw-golf7-r-rear-diffuser-isolated-v1)\.webp$/);
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
