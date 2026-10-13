// Canned public text only, not a live API/integration test.
const categories = [
  { slug: 'exterior', name: 'Extérieur', description: 'Calandres, spoilers et kits carrosserie pour transformer votre véhicule.' },
  { slug: 'interior', name: 'Intérieur', description: 'Écrans CarPlay, tableaux de bord digitaux et accessoires premium.' },
  { slug: 'multimedia-technology', name: 'Multimédia et technologie', description: 'Écrans CarPlay, dashcams, caméras de recul et accessoires connectés.' },
];
const names = { porsche: 'Porsche', volkswagen: 'Volkswagen', toyota: 'Toyota', bmw: 'BMW', 'mercedes-benz': 'Mercedes-Benz', audi: 'Audi' };
export const Categories = { list: async () => categories, get: async slug => categories.find(cat => cat.slug === ({performance:'exterior',technology:'multimedia-technology'}[slug] || slug)) };
export const Brands = { list: async () => [], get: async slug => ({ slug, name: names[slug] || slug, image: 'https://images.pexels.com/photos/27118861/pexels-photo-27118861.jpeg?auto=compress&w=640', description: `Éléments aérodynamiques, finitions premium et accessoires de performance conçus pour les passionnés ${names[slug]}.` }) };
export const Products = { list: async () => ({ items: [] }) };
