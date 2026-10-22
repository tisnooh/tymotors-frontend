import edits from '@/data/productPhotoEdits.json';

// Exact-source presentation edits only. Original catalogue records stay intact;
// a new catalogue URL is never silently replaced by an older retouched photo.
export function productPhoto(source) {
  return edits[source]?.image || source;
}

// A reviewed cutout may keep the real installed photograph as a secondary view.
// Match the original URL exactly so later catalogue edits always take priority.
export function productPhotoContext(source) {
  return edits[source]?.contextImage;
}
