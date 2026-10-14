// Canned public text only, not a live API/integration test.
const categories = [
  { slug: 'exterior', name: 'Extérieur', description: 'Calandres, spoilers et kits carrosserie pour transformer votre véhicule.' },
  { slug: 'interior', name: 'Intérieur', description: 'Écrans CarPlay, tableaux de bord digitaux et accessoires premium.' },
  { slug: 'multimedia-technology', name: 'Multimédia et technologie', description: 'Écrans CarPlay, dashcams, caméras de recul et accessoires connectés.' },
];
const names = { porsche: 'Porsche', volkswagen: 'Volkswagen', toyota: 'Toyota', bmw: 'BMW', 'mercedes-benz': 'Mercedes-Benz', audi: 'Audi' };
export const Categories = { list: async () => categories, get: async slug => categories.find(cat => cat.slug === ({performance:'exterior',technology:'multimedia-technology'}[slug] || slug)) };
// Public brand snapshots for realistic section-height QA; no live database.
const brandFixtures = [
  ['bmw', "La performance à l'état pur", '1617531653332-bd46c24f2068'],
  ['mercedes-benz', "L'élégance rencontre la puissance", '1618843479313-40f8afb4b4d8'],
  ['audi', "L'esprit RS sans compromis", '1655497520292-e445bffca81b'],
  ['porsche', 'Inspiré par le circuit', '1658863567312-fcaf9a15bc6f'],
  ['volkswagen', 'Das Auto', '1680416825319-14f8091e5aeb'],
  ['toyota', 'Conçue pour se démarquer', '1743308298784-ba0b26dbfac7'],
].map(([slug, tagline, photo]) => ({ slug, name: names[slug], tagline,
  image: `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=1600&q=80` }));
export const Brands = { list: async () => brandFixtures, get: async slug => ({ slug, name: names[slug] || slug, image: 'https://images.pexels.com/photos/27118861/pexels-photo-27118861.jpeg?auto=compress&w=640', description: `Éléments aérodynamiques, finitions premium et accessoires de performance conçus pour les passionnés ${names[slug]}.` }) };
// Snapshots of public catalogue fields for layout QA; never seed/write a base.
// Prices/availability on the real site still come exclusively from its API.
const catalogueFixtures = [
  ['mercedes-w205-rear-spoiler', 'Spoiler W205', 'Mercedes Classe C W205', 'Spoilers', 139, '1787842828', 'x5yreskr94yph3zkkxbo', '1787859858', 'wwqnis5xrj4k6etlxkfw'],
  ['mercedes-w177-amg-side-vents', 'Side Vents W177', 'Mercedes Classe A W177', 'Extérieur', 69, '1787842817', 'r4ixlwwq8hlnrofhpux0', '1787859849', 'cgqgb8es7xkkwe8mxzjz'],
  ['mercedes-w205-mirror-caps', 'Coques Rétroviseurs W205', 'Mercedes Classe C W205', 'Rétroviseurs', 79, '1787842823', 'iss8sa9bnh7x1q55fhfb', '1787859854', 'fhyc8ulgou0wtxawxizd'],
  ['vw-golf7-gti-r-spoiler', 'Spoiler Golf 7 GTI/R', 'Volkswagen Golf 7 GTI / R', 'Spoilers', 129, '1787842866', 'kw6jsvqplw6eetu4rp33', '1787859893', 'g58hxzwk7bk0fyq7ywrt'],
  ['vw-golf7-gti-grille', 'Calandre Golf 7 GTI', 'Volkswagen Golf 7', 'Calandres', 129, '1787842863', 'tm1jxucojhsskyn3nadk', '1787859891', 'h8pzre7pgbgt0sp2r1w3'],
  ['vw-golf7-mirror-caps', 'Coques Rétroviseurs Golf 7', 'Volkswagen Golf 7', 'Rétroviseurs', 69, '1787842869', 'bdysn0qka2jiui9a1taw', '1787859895', 'm6gyclbs7v7oqpbpa9d4'],
  ['vw-golf7-r-rear-diffuser', 'Diffuseur Golf 7 R', 'Volkswagen Golf 7 R', 'Diffuseurs', 199, '1787871934', 'miosmu0iblk9dzvrbt3f', '1787859897', 'hn2rmcojdsrydxoog8a2'],
  ['porsche-911-rear-spoiler', 'Spoiler Arrière 911 GT Style', 'Porsche 911 992 / 991', 'Spoilers', 389, '1787871928', 'il4hozpi5u14vqclnhya', '1787859864', 'fp03u9ixdpcejzw2pyku'],
].map(([slug, name, subtitle, subcategory, price, version, image, hoverVersion, hoverImage]) => ({
  id: `visual-${slug}`, slug, name, subtitle, subcategory, price, currency: 'EUR',
  images: [`https://res.cloudinary.com/dwsyixjux/image/upload/v${version}/tymotors/products/${image}.png`,
    `https://res.cloudinary.com/dwsyixjux/image/upload/v${hoverVersion}/tymotors/products/${hoverImage}.png`],
  compatible_brands: [], status: 'draft', stock: 0, test_purchase: true,
}));
export const Products = { list: async (params = {}) => {
  const fixture = new URLSearchParams(window.location.search).get('products');
  if (fixture === 'error') throw new Error('Catalogue unavailable — isolated QA fixture');
  if (fixture === 'empty') return { items: [] };
  const scenario = new URLSearchParams(window.location.search).get('search');
  if (params.q && scenario === 'error') throw new Error('Search unavailable — isolated QA fixture');
  const items = params.featured && fixture !== 'featured' ? [] : catalogueFixtures;
  const matched = params.q ? items.filter(product => `${product.name} ${product.subtitle}`.toLowerCase().includes(params.q.trim().toLowerCase())) : items;
  return { items: matched.slice(0, params.limit || 8), total: matched.length };
} };
