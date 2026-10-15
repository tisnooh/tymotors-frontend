export const VIEW_CATEGORIES = ['performance', 'interior', 'technology'];

export function catalogueCategory(value) {
  const category = ({ exterior: 'performance', 'multimedia-technology': 'technology' })[value] || value;
  return VIEW_CATEGORIES.includes(category) ? category : 'all';
}

const W177_VIEWS = {
  noteKey: 'customize.project.w177_view_note',
  performance: { src: '/images/customize/w177/exterior-v1.webp', altKey: 'customize.project.w177_exterior_alt' },
  interior: { src: '/images/customize/w177/interior-v2.webp', altKey: 'customize.project.w177_interior_alt' },
  technology: { src: '/images/customize/w177/technology-v1.webp', altKey: 'customize.project.w177_technology_alt' },
};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Only install reviewed views for their own model/phase. Never borrow a cabin
// from another generation, facelift or explicitly different body/trim.
export function vehicleViewSet(selection) {
  if (selection.brand !== 'mercedes-benz' || normalize(selection.model) !== 'classea' || normalize(selection.generation) !== 'w177') return null;
  if (selection.year && (!Number.isInteger(Number(selection.year)) || Number(selection.year) < 2018 || Number(selection.year) > 2022)) return null;
  const body = normalize(selection.body_type);
  if (body && !['compacte', 'hatchback', '5portes', 'berline5portes', 'bicorps'].includes(body)) return null;
  if (selection.trim && normalize(selection.trim) !== 'amgline') return null;
  return W177_VIEWS;
}
