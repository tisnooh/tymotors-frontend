import secondPhotos from '@/data/productSecondPhotos.json';
import galleryAdditions from '@/data/productGalleryAdditions.json';
import legacyFramedPhotos from '@/data/productLegacyFramedPhotos.json';

const legacyFramedImages = new Set(Object.values(legacyFramedPhotos).map(photo => photo.previousImage));

// Exclude only exact, visually reviewed legacy assets, wherever they appear.
// Preserve the catalogue and source files, as well as future replacement URLs.
function withoutLegacyFrames(images) {
  if (!Array.isArray(images) || !images.some(src => legacyFramedImages.has(src))) return images;
  return images.filter(src => !legacyFramedImages.has(src));
}

// Restrict this photo refresh to the reviewed, legacy second images. A later
// catalogue edit takes precedence. Append every reviewed seller view without a
// numerical cap, preserving image 1 and unrelated catalogue images.
export function productGallery(product) {
  const images = product?.images;
  const replacement = secondPhotos[product?.slug];
  if (!replacement || !Array.isArray(images) || images.length < 2
    || images[1] !== replacement.previousImage) return withoutLegacyFrames(images);
  const additions = galleryAdditions[product.slug] || [];
  const refreshed = [images[0], replacement.image];
  for (const src of images.slice(2)) {
    const image = additions.find((photo) => photo.sourceImage === src)?.image || src;
    if (!refreshed.includes(image)) refreshed.push(image);
  }
  const seen = new Set(refreshed);
  for (const photo of additions) {
    if (!seen.has(photo.image)) {
      refreshed.push(photo.image);
      seen.add(photo.image);
    }
  }
  return withoutLegacyFrames(refreshed);
}

// Cards and detail galleries share the same exclusions.
export function productCardPhotos(product) {
  const images = productGallery(product);
  if (!Array.isArray(images)) return images;
  return images.slice(0, 2);
}

export function productPhotoFit(image, index) {
  return index === 1 || image?.startsWith('/images/products/seller-gallery-natural/')
    ? 'object-contain' : 'object-cover';
}
