import secondPhotos from '@/data/productSecondPhotos.json';
import galleryAdditions from '@/data/productGalleryAdditions.json';

// Restrict this photo refresh to the reviewed, legacy second images. A later
// catalogue edit takes precedence. Append every reviewed seller view without a
// numerical cap, preserving image 1 and unrelated catalogue images.
export function productGallery(product) {
  const images = product?.images;
  const replacement = secondPhotos[product?.slug];
  if (!replacement || !Array.isArray(images) || images.length < 2
    || images[1] !== replacement.previousImage) return images;
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
  return refreshed;
}

export function productPhotoFit(image, index) {
  return index === 1 || image?.startsWith('/images/products/seller-gallery-natural/')
    ? 'object-contain' : 'object-cover';
}
