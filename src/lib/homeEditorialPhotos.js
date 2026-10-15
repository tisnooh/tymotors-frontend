// Independent inspiration, never product/cart images. Primary licences checked 2026-10-15.
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
export const HOME_PHOTOS = {
  bmw: commonsPhoto('bmw', 'bmw-m4cs-vr46', 1280, 853, 'Strubbl', 'BMW M4 CS Edition VR46 in der BMW Welt München Bild 1 2025-04-15', 'BMW_M4_CS_Edition_VR46_in_der_BMW_Welt_M%C3%BCnchen_Bild_1_2025-04-15.jpg'),
  mercedes: commonsPhoto('mercedes', 'mercedes-amg-gtr-grey', 1280, 853, 'Mr.choppers', '2018 Mercedes-Benz AMG GT-R, designo matte Selenite Grey Magno, front right', '2018_Mercedes-Benz_AMG_GT-R,_designo_matte_Selenite_Grey_Magno,_front_right.jpg', '3.0'),
  audi: commonsPhoto('audi', 'audi-rs6-c8', 1280, 853, 'Sestmedia', 'Audi rs6 c8 2020-4', 'Audi_rs6_c8_2020-4.jpg'),
  porsche: flickrPhoto('porsche', 'porsche-manthey', 1024, 683, 'Alexandre Prevot', 'Porsche 992 GT3 RS Manthey Racing', '54309097379', 'alexprevot', true),
  volkswagen: commonsPhoto('volkswagen', 'volkswagen-golf-r-black', 1280, 855, 'Alexander-93', 'Volkswagen Golf VIII R Black Edition Auto Zuerich 2024 DSC 6898', 'Volkswagen_Golf_VIII_R_Black_Edition_Auto_Zuerich_2024_DSC_6898.jpg'),
  toyota: commonsPhoto('toyota', 'toyota-gr-supra-black', 1280, 853, 'Ethan Llamas', 'Toyota GR Supra DB41 3.0L Turbo Black Metallic 01', 'Toyota_GR_Supra_DB41_3.0L_Turbo_Black_Metallic_01.jpg'),
  cockpit: commonsPhoto('cockpit', 'technology-bmw-g81', 1280, 853, 'Ethan Llamas', 'BMW M3 Competition G81 xDrive Touring interior', 'BMW_M3_Competition_G81_xDrive_Touring_interior.jpg'),
  technology: commonsPhoto('technology', 'technology-android-auto', 1280, 851, 'Mavila2', 'Android Auto in usage', 'Android_Auto_in_usage.jpg'),
  detail: commonsPhoto('detail', 'detail-amg-gtr-wheel', 1280, 925, 'Tokumeigakarinoaoshima', 'The tire wheel of Mercedes-AMG GT R (C190)', 'The_tire_wheel_of_Mercedes-AMG_GT_R_(C190).jpg'),
};
export const HOME_BRAND_PHOTOS = {
  bmw: HOME_PHOTOS.bmw, 'mercedes-benz': HOME_PHOTOS.mercedes, audi: HOME_PHOTOS.audi,
  porsche: HOME_PHOTOS.porsche, volkswagen: HOME_PHOTOS.volkswagen, toyota: HOME_PHOTOS.toyota,
};
export const HOME_CATEGORY_PHOTOS = {
  performance: HOME_PHOTOS.bmw, interior: HOME_PHOTOS.cockpit, technology: HOME_PHOTOS.technology,
};
