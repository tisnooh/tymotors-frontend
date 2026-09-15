const UNSPLASH_HOST = 'images.unsplash.com';

function isUnsplash(source) {
  try {
    return new URL(source).hostname === UNSPLASH_HOST;
  } catch {
    return false;
  }
}

export function optimizedImageUrl(source, width, quality = 72) {
  if (!isUnsplash(source)) return source;
  const url = new URL(source);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  return url.toString();
}

export function responsiveImageProps(source, widths, sizes, quality = 72) {
  if (!isUnsplash(source)) return { src: source };
  const normalized = [...new Set(widths)].sort((a, b) => a - b);
  return {
    src: optimizedImageUrl(source, normalized[normalized.length - 1], quality),
    srcSet: normalized.map((width) => `${optimizedImageUrl(source, width, quality)} ${width}w`).join(', '),
    sizes,
  };
}
