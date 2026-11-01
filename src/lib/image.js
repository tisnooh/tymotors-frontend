const UNSPLASH_HOST = 'images.unsplash.com';
const PRODUCT_CLOUDINARY_HOST = 'res.cloudinary.com';

function isUnsplash(source) {
  try {
    return new URL(source).hostname === UNSPLASH_HOST;
  } catch {
    return false;
  }
}

export function optimizedImageUrl(source, width, quality = 72) {
  try {
    const url = new URL(source);
    if (url.hostname === PRODUCT_CLOUDINARY_HOST && url.pathname.startsWith('/dwsyixjux/image/upload/')
        && !url.pathname.includes('/f_auto,')) {
      const transform = `f_auto,q_auto:best${width ? `,w_${width}` : ''}`;
      url.pathname = url.pathname.replace('/image/upload/', `/image/upload/${transform}/`);
      return url.toString();
    }
  } catch { /* Local images retain their original URL. */ }
  if (!isUnsplash(source)) return source;
  if (!width) return source;
  const url = new URL(source);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  return url.toString();
}

export function responsiveImageProps(source, widths, sizes, quality = 72) {
  let cloudinary = false;
  try {
    const url = new URL(source);
    cloudinary = url.hostname === PRODUCT_CLOUDINARY_HOST && url.pathname.startsWith('/dwsyixjux/image/upload/')
      && !url.pathname.includes('/f_auto,');
  } catch { /* Local images have no responsive remote transform. */ }
  if (!isUnsplash(source) && !cloudinary) return { src: source };
  const normalized = [...new Set(widths)].sort((a, b) => a - b);
  return {
    src: optimizedImageUrl(source, normalized[normalized.length - 1], quality),
    srcSet: normalized.map((width) => `${optimizedImageUrl(source, width, quality)} ${width}w`).join(', '),
    sizes,
  };
}
