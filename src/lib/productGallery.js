import secondPhotos from '@/data/productSecondPhotos.json';

// Restrict this photo refresh to the reviewed, legacy second images. A later
// catalogue edit takes precedence; image 1 and any additional views stay intact.
export function productGallery(product) {
  const images = product?.images;
  const replacement = secondPhotos[product?.slug];
  if (!replacement || !Array.isArray(images) || images.length < 2
    || images[1] !== replacement.previousImage) return images;
  return [images[0], replacement.image, ...images.slice(2)];
}
