// Editorial inspiration only; never used for product or cart photos.
// Source pages and licence: docs/HOME_IMAGE_CREDITS.md.
const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&q=78`;
export const EDITORIAL_IMAGES = {
  performance: { src: pexels('27118861'), position: '50% 58%' },
  interior: { src: pexels('31536572'), position: '50% 53%' },
  technology: { src: pexels('24201393'), position: '50% 36%' },
  gathering: { src: pexels('32103160'), position: '50% 78%' },
  detail: { src: pexels('31768888'), position: '50% 50%' },
  silhouette: { src: pexels('27118859'), position: '50% 53%' },
};
export function categoryEditorialImage(slug) {
  const key = { exterior: 'performance', 'multimedia-technology': 'technology' }[slug] || slug;
  return ['performance', 'interior', 'technology'].includes(key) ? EDITORIAL_IMAGES[key] : null;
}
export function editorialImageProps(image, sizes = '100vw') {
  const resize = (width) => {
    const url = new URL(image.src);
    url.searchParams.set('w', String(width));
    return url.toString();
  };
  return { src: resize(960), srcSet: [400, 640, 960, 1400].map(width => `${resize(width)} ${width}w`).join(', '), sizes };
}
