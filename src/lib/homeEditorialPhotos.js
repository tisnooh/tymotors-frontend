// Independent inspiration, never product/cart images. Selections updated 2026-10-16.
// Original bytes and provenance: public/images/home/CREDITS.md.
const flickrPhoto = (id, file, width, height, author, title, sourceId, user, shareAlike = false) => ({
  id, src: `/images/home/${file}.jpg`, width, height, author, title,
  altKey: `home_photos.alts.${id}`,
  source: `https://www.flickr.com/photos/${user}/${sourceId}/`,
  licence: shareAlike ? 'CC BY-SA 2.0' : 'CC BY 2.0',
  licenceUrl: `https://creativecommons.org/licenses/${shareAlike ? 'by-sa' : 'by'}/2.0/`,
});
const commonsPhoto = (id, file, width, height, author, title, sourceFile, version = '4.0') => ({
  id, src: `/images/home/${file}.jpg`, width, height, author, title,
  altKey: `home_photos.alts.${id}`,
  source: `https://commons.wikimedia.org/wiki/File:${sourceFile}`,
  licence: `CC BY-SA ${version}`, licenceUrl: `https://creativecommons.org/licenses/by-sa/${version}/`,
});
// A public third-party page is provenance, not a reuse licence or permission.
const independentPhoto = (id, file, width, height, author, title, source) => ({
  id, src: `/images/home/${file}.jpg`, width, height, author, title, source,
  altKey: `home_photos.alts.${id}`,
  licence: null, licenceUrl: null, rightsStatus: 'unverified',
});
const redditPhoto = independentPhoto;
export const HOME_PHOTOS = {
  culture: redditPhoto('culture', 'culture-bmw-m4-widebody', 3276, 4096, 'Kyle Fletcher (credited by u/testsubjectno999)', 'BMW M4 [3276x4096]', 'https://www.reddit.com/r/carporn/comments/1i6oezk/bmw_m4_3276x4096/'),
  sport: redditPhoto('sport', 'sport-porsche-gt3rs-night', 5779, 3853, 'u/Exhibitions_of_Speed', 'GT3RS At Night', 'https://www.reddit.com/r/porsche911/comments/1r0h6kx/gt3rs_at_night/'),
  bmw: redditPhoto('bmw', 'bmw-430i-black-reddit', 2591, 3317, 'u/knrdv', 'Bleeding Black', 'https://www.reddit.com/r/carphotography/comments/1jk7zm5/bleeding_black/'),
  mercedes: commonsPhoto('mercedes', 'mercedes-amg-gtr-grey', 1280, 853, 'Mr.choppers', '2018 Mercedes-Benz AMG GT-R, designo matte Selenite Grey Magno, front right', '2018_Mercedes-Benz_AMG_GT-R,_designo_matte_Selenite_Grey_Magno,_front_right.jpg', '3.0'),
  mercedesBrand: redditPhoto('mercedesBrand', 'mercedes-s63-three-quarter-reddit', 6790, 3809, 'u/V1p3rlucky', 'S63 Yellow Night Photoshoot', 'https://www.reddit.com/r/AMG/comments/1j7uuif/s63_yellow_night_photoshoot/'),
  audi: redditPhoto('audi', 'audi-s5-black-reddit', 3264, 4928, 'u/_Quality_Content_ (posting account)', 'S5 Sportback I shot, I love black on these cars it makes them look absolutely evil.', 'https://www.reddit.com/r/Audi/comments/18gkxhn/s5_sportback_i_shot_i_love_black_on_these_cars_it/'),
  porsche: flickrPhoto('porsche', 'porsche-manthey', 1024, 683, 'Alexandre Prevot', 'Porsche 992 GT3 RS Manthey Racing', '54309097379', 'alexprevot', true),
  porscheBrand: redditPhoto('porscheBrand', 'porsche-gt3-touring-silver-reddit', 1080, 1080, 'u/demoralising (posting account; photographer unconfirmed)', 'Porsche 911 GT3 Touring [1080x1080]', 'https://www.reddit.com/r/carporn/comments/r91zqe/porsche_911_gt3_touring_1080x1080/'),
  volkswagen: redditPhoto('volkswagen', 'volkswagen-golf-r-anthracite-reddit', 4000, 6000, 'u/ninjaxmist1 (posting account; photographer signature retained)', 'A quick photoshoot with my Buddy’s golf', 'https://www.reddit.com/r/GolfGTI/comments/u65t96/a_quick_photoshoot_with_my_buddys_golf/?i=1'),
  toyota: independentPhoto('toyota', 'toyota-supra-levella-night', 1280, 854, null, 'Toyota GR Supra LEVELLA-MANSORY 1 of 1', 'https://www.garaget.org/?car=426889&image=4015280'),
  cockpit: commonsPhoto('cockpit', 'technology-bmw-g81', 1280, 853, 'Ethan Llamas', 'BMW M3 Competition G81 xDrive Touring interior', 'BMW_M3_Competition_G81_xDrive_Touring_interior.jpg'),
  technology: commonsPhoto('technology', 'technology-android-auto', 1280, 851, 'Mavila2', 'Android Auto in usage', 'Android_Auto_in_usage.jpg'),
  detail: redditPhoto('detail', 'detail-amg-red-caliper-reddit', 2541, 2737, null, 'Simple picture of extraordinary things', 'https://www.reddit.com/r/AMG/comments/lbrha9/simple_picture_of_extraordinary_things/'),
};
export const HOME_BRAND_PHOTOS = {
  bmw: HOME_PHOTOS.bmw, 'mercedes-benz': HOME_PHOTOS.mercedesBrand, audi: HOME_PHOTOS.audi,
  porsche: HOME_PHOTOS.porscheBrand, volkswagen: HOME_PHOTOS.volkswagen, toyota: HOME_PHOTOS.toyota,
};
export const HOME_CATEGORY_PHOTOS = {
  performance: HOME_PHOTOS.bmw, interior: HOME_PHOTOS.cockpit, technology: HOME_PHOTOS.technology,
};
