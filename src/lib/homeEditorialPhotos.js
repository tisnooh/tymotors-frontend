// Independent inspiration, never product/cart images. Primary licences checked 2026-10-15.
// Original bytes and provenance: public/images/home/CREDITS.md.
const flickrPhoto = (id, file, width, height, author, title, sourceId, user = 'concavowheels', shareAlike = false) => ({
  id, src: `/images/home/${file}.jpg`, width, height, author, title,
  altKey: `home_photos.alts.${id}`,
  source: `https://www.flickr.com/photos/${user}/${sourceId}/`,
  licence: shareAlike ? 'CC BY-SA 2.0' : 'CC BY 2.0',
  licenceUrl: `https://creativecommons.org/licenses/${shareAlike ? 'by-sa' : 'by'}/2.0/`,
});
const motorPhoto = (id, file, number) => ({
  id, src: `/images/home/${file}.jpg`, width: 1600, height: 1067,
  altKey: `home_photos.alts.${id}`, author: 'Motor.es',
  title: `Toyota GR Supra MY2020 — photograph ${number}`,
  source: `https://www.motor.es/toyota/gr-supra/fotos/toyota-gr-supra-my2020-52/${number > 84 ? '4' : ''}`,
  licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
});
export const HOME_PHOTOS = {
  bmw: flickrPhoto('bmw', 'bmw-concavo', 1024, 683, 'CONCAVO WHEELS', 'BMW E93 on 20" CW-S5 Matte Black Machined Face', '8069107658'),
  mercedes: flickrPhoto('mercedes', 'mercedes-concavo', 1023, 682, 'CONCAVO WHEELS', 'concavo-black-mercedes-sclass-cw5-9', '16319105556'),
  audi: flickrPhoto('audi', 'audi-concavo', 1024, 683, 'CONCAVO WHEELS', 'Audi S7 on 22x10.5 CW-5 Custom Finish', '32899989186'),
  porsche: flickrPhoto('porsche', 'porsche-manthey', 1024, 683, 'Alexandre Prevot', 'Porsche 992 GT3 RS Manthey Racing', '54309097379', 'alexprevot', true),
  volkswagen: {
    id: 'volkswagen', src: '/images/home/volkswagen-tuning.jpg', width: 1280, height: 785,
    altKey: 'home_photos.alts.volkswagen', author: 'Monaam Ben Fredj', title: 'Tuning Volkswagen Golf VI',
    source: 'https://commons.wikimedia.org/wiki/File:Tuning_Volkswagen_Golf_VI.jpg',
    licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  toyota: motorPhoto('toyota', 'toyota-supra-motor', 2),
  cockpit: motorPhoto('cockpit', 'interior-supra-motor', 85),
  technology: {
    id: 'technology', src: '/images/home/technology-bmw-g81.jpg', width: 1280, height: 853,
    altKey: 'home_photos.alts.technology', author: 'Ethan Llamas', title: 'BMW M3 Competition G81 xDrive Touring interior',
    source: 'https://commons.wikimedia.org/wiki/File:BMW_M3_Competition_G81_xDrive_Touring_interior.jpg',
    licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  detail: flickrPhoto('detail', 'detail-bmw-concavo', 1024, 683, 'CONCAVO WHEELS', 'BMW E90 M3 Concavo CW-5', '8031855027'),
};
export const HOME_BRAND_PHOTOS = {
  bmw: HOME_PHOTOS.bmw, 'mercedes-benz': HOME_PHOTOS.mercedes, audi: HOME_PHOTOS.audi,
  porsche: HOME_PHOTOS.porsche, volkswagen: HOME_PHOTOS.volkswagen, toyota: HOME_PHOTOS.toyota,
};
export const HOME_CATEGORY_PHOTOS = {
  performance: HOME_PHOTOS.bmw, interior: HOME_PHOTOS.cockpit, technology: HOME_PHOTOS.technology,
};
