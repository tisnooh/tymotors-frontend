import edits from '@/data/productPhotoEdits.json';

// Exact-source presentation edits only. Original catalogue records stay intact;
// a new catalogue URL is never silently replaced by an older retouched photo.
export function productPhoto(source) {
  return edits[source]?.image || source;
}
