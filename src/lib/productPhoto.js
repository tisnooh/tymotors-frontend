import edits from '@/data/productPhotoEdits.json';
import restrictions from '@/data/productPhotoRestrictions.json';

const restrictedImages = new Set(restrictions.restrictions.flatMap(entry => entry.images));
const restrictedPublicIds = new Set(restrictions.restrictions.flatMap(entry => entry.cloudinaryPublicIds));
const restrictedSourceHosts = new Set(restrictions.restrictions.flatMap(entry => entry.sourceHosts || []));
const restrictedFileMarkers = restrictions.restrictions.flatMap(entry => entry.sourceFileMarkers || []);

export function productPhotoRestricted(source) {
  if (typeof source !== 'string') return false;
  if (restrictedImages.has(source)) return true;
  try {
    const url = new URL(source, 'https://tymotors.vercel.app');
    const pathname = decodeURIComponent(url.pathname);
    if (restrictedSourceHosts.has(url.hostname) && pathname.startsWith('/cdn/')) return true;
    if (restrictedFileMarkers.some(marker => pathname.includes(marker))) return true;
    // Match public IDs, not version/format/query parameters or the product slug.
    if (url.hostname !== 'res.cloudinary.com' || !pathname.startsWith('/dwsyixjux/')) return false;
    return [...restrictedPublicIds].some(id => pathname.endsWith(`/${id}`)
      || pathname.slice(0, pathname.lastIndexOf('.')).endsWith(`/${id}`));
  } catch { return false; }
}

// Exact-source presentation edits only. Original catalogue records stay intact;
// a new catalogue URL is never silently replaced by an older retouched photo.
export function productPhoto(source) {
  const presented = edits[source]?.image || source;
  return productPhotoRestricted(source) || productPhotoRestricted(presented)
    ? restrictions.placeholder : presented;
}

// A reviewed cutout may keep the real installed photograph as a secondary view.
// Match the original URL exactly so later catalogue edits always take priority.
export function productPhotoContext(source) {
  const context = edits[source]?.contextImage;
  return productPhotoRestricted(source) || productPhotoRestricted(context) ? undefined : context;
}
