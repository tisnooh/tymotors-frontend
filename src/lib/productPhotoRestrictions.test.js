import { productPhoto, productPhotoContext, productPhotoRestricted } from './productPhoto';
import { productGallery, productCardPhotos } from './productGallery';
import restrictions from '@/data/productPhotoRestrictions.json';
import catalogue from './__fixtures__/productGalleryAudit.json';
import fs from 'fs';
import path from 'path';

test('the declined SCP images and their delivery variants never reach a product presentation', () => {
  for (const source of restrictions.restrictions[0].images) {
    for (const variant of [source, `${source}?v=2`, `${source}#preview`, source.replace('/upload/', '/upload/c_fill,w_400/').replace('.png', '.webp')]) {
      expect(productPhotoRestricted(variant)).toBe(true);
      expect(productPhoto(variant)).toBe(restrictions.placeholder);
      expect(productPhotoContext(variant)).toBeUndefined();
    }
  }
  const product = catalogue.find(p => p.slug === 'bmw-logo-door-projectors');
  const before = [...product.images];
  expect(productGallery(product)).toEqual([restrictions.placeholder]);
  expect(productCardPhotos(product)).toEqual([restrictions.placeholder]);
  expect(product.images).toEqual(before);
  expect(fs.existsSync(path.join(process.cwd(), 'public', restrictions.placeholder))).toBe(true);
});

test('a separately reviewed future replacement is not blocked by the product slug', () => {
  const product = { slug: 'bmw-logo-door-projectors', images: ['/future-authorized-photo.webp'] };
  expect(productGallery(product)).toEqual(product.images);
  expect(productPhoto('/unrelated.webp')).toBe('/unrelated.webp');
  expect(productPhoto(undefined)).toBeUndefined();
});

test('the cleaned API payload still displays a neutral pending photograph', () => {
  const product = { slug: 'bmw-logo-door-projectors', images: [] };
  expect(productGallery(product)).toEqual([restrictions.placeholder]);
  expect(productCardPhotos(product)).toEqual([restrictions.placeholder]);
  expect(product.images).toEqual([]);
});

test('SCP original and resized CDN copies cannot bypass the presentation guard', () => {
  const sources = [
    'https://scpautomotive.co.uk/cdn/shop/files/another-refused-product.jpg?width=300',
    'https://www.scpautomotive.co.uk/cdn/shop/files/BMW.jpg',
    'https://cdn.shopify.com/s/files/1/0/BMW-LED-Door-Projector-_Pair_-BMW-Logo-SCP-Automotive-90141840_200x.jpg',
    'https://RES.CLOUDINARY.COM/dwsyixjux/image/upload/c_scale,w_40/v1/tymotors/products/o5ylil1cryn4uertnc89.jpg?x=1',
  ];
  for (const source of sources) {
    expect(productPhotoRestricted(source)).toBe(true);
    expect(productPhoto(source)).toBe(restrictions.placeholder);
  }
  expect(productPhotoRestricted('https://example.com/authorized-new.webp')).toBe(false);
});
