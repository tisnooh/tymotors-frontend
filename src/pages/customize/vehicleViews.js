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

const SEDAN = ['berline', 'sedan', '4portes'];
const HATCH = ['compacte', 'hatchback', '5portes', 'berline5portes', 'bicorps', 'sportback'];

// These are illustrative configurations, not a VIN/option decoder. Year ranges
// deliberately exclude ambiguous facelift years and cabins not reviewed here.
export const REVIEWED_VEHICLES = [
  { id: 'bmw-f30-f35', brand: 'bmw', model: 'Série 3', generation: 'F30 / F35', vehicle: 'BMW Série 3 F30 / F35', year: 2016, years: [2012, 2016], bodies: SEDAN, trims: ['msport'] },
  { id: 'bmw-g20', brand: 'bmw', model: 'Série 3', generation: 'G20', vehicle: 'BMW Série 3 G20', year: 2020, years: [2019, 2021], bodies: SEDAN, trims: ['msport'] },
  { id: 'bmw-f32-f36', brand: 'bmw', model: 'Série 4', generation: 'F32 / F36', vehicle: 'BMW Série 4 F32 / F36', year: 2016, years: [2014, 2016], bodies: ['coupe', '2portes'], trims: ['msport'] },
  { id: 'mercedes-w205', brand: 'mercedes-benz', model: 'Classe C', generation: 'W205', vehicle: 'Mercedes-Benz Classe C W205', year: 2016, years: [2014, 2017], bodies: SEDAN, trims: ['amgline'] },
  { id: 'audi-a3-8v', brand: 'audi', model: 'A3', generation: '8V', vehicle: 'Audi A3 8V', year: 2017, years: [2017, 2020], bodies: HATCH, trims: ['sline'] },
  { id: 'audi-a4-b9', brand: 'audi', model: 'A4', generation: 'B9', vehicle: 'Audi A4 B9', year: 2017, years: [2016, 2018], bodies: SEDAN, trims: ['sline'] },
  { id: 'porsche-991', brand: 'porsche', model: '911', generation: '991', vehicle: 'Porsche 911 991', year: 2017, years: [2016, 2019], bodies: ['coupe', '2portes'], trims: ['carrera'] },
  { id: 'porsche-992', brand: 'porsche', model: '911', generation: '992', vehicle: 'Porsche 911 992', year: 2020, years: [2019, 2023], bodies: ['coupe', '2portes'], trims: ['carrera'] },
  { id: 'porsche-cayenne-9ya', brand: 'porsche', model: 'Cayenne', generation: '9YA', vehicle: 'Porsche Cayenne 9YA', year: 2019, years: [2018, 2022], bodies: ['suv', '5portes'], trims: [] },
  { id: 'volkswagen-golf-7-gti', brand: 'volkswagen', model: 'Golf 7', generation: 'GTI', vehicle: 'Volkswagen Golf 7 GTI', year: 2016, years: [2013, 2016], bodies: HATCH, trims: ['gti'] },
  { id: 'volkswagen-golf-7-r', brand: 'volkswagen', model: 'Golf 7', generation: 'R', vehicle: 'Volkswagen Golf 7 R', year: 2016, years: [2013, 2016], bodies: HATCH, trims: ['r'] },
  { id: 'toyota-gr-supra-a90', brand: 'toyota', model: 'GR Supra', generation: 'A90', vehicle: 'Toyota GR Supra A90', year: 2020, years: [2019, 2022], bodies: ['coupe', '2portes'], trims: [] },
  { id: 'toyota-gr-yaris-xp210', brand: 'toyota', model: 'GR Yaris', generation: 'XP210', vehicle: 'Toyota GR Yaris XP210', year: 2021, years: [2020, 2023], bodies: ['compacte', 'hatchback', '3portes', 'bicorps'], trims: [] },
];

const reviewedSets = new Map(REVIEWED_VEHICLES.map(item => [item.id, {
  noteKey: `customize.project.${item.id.replace(/-/g, '_')}_view_note`,
  altValues: { vehicle: item.vehicle, year: item.year },
  ...Object.fromEntries(VIEW_CATEGORIES.map(category => [category, {
    src: `/images/customize/${item.id}/${category === 'performance' ? 'exterior' : category}-v1.webp`,
    altKey: `customize.project.reviewed_${category}_alt`,
  }])),
}]));

function matchesDetails(selection, years, bodies, trims) {
  if (selection.year && (!Number.isInteger(Number(selection.year)) || Number(selection.year) < years[0] || Number(selection.year) > years[1])) return false;
  if (selection.body_type && !bodies.includes(normalize(selection.body_type))) return false;
  if (selection.trim && !trims.includes(normalize(selection.trim))) return false;
  return true;
}

// Only install reviewed views for their own model/phase. Never borrow a cabin
// from another generation, facelift or explicitly different body/trim.
export function vehicleViewSet(selection) {
  if (selection.brand === 'mercedes-benz' && normalize(selection.model) === 'classea' && normalize(selection.generation) === 'w177') {
    return matchesDetails(selection, [2018, 2022], HATCH.filter(body => body !== 'sportback'), ['amgline']) ? W177_VIEWS : null;
  }
  const item = REVIEWED_VEHICLES.find(entry => selection.brand === entry.brand && normalize(selection.model) === normalize(entry.model) && normalize(selection.generation) === normalize(entry.generation));
  return item && matchesDetails(selection, item.years, item.bodies, item.trims) ? reviewedSets.get(item.id) : null;
}
