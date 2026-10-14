// Homepage inspiration only. Never use these photographs for product/cart images.
// Sources, licences and file hashes: public/images/home/CREDITS.md.
export const HOME_PHOTOS = {
  cockpit: {
    id: 'cockpit', src: '/images/home/cockpit-bmw-m3.jpg', width: 1280, height: 1642,
    altKey: 'home_photos.alts.cockpit', author: 'Cedric Ramirez',
    title: 'Geneva Motor Show 2011 - BMW M3 Coupe Interior (5560369057)',
    source: 'https://commons.wikimedia.org/wiki/File:Geneva_Motor_Show_2011_-_BMW_M3_Coupe_Interior_(5560369057).jpg',
    licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  },
  carplay: {
    id: 'carplay', src: '/images/home/carplay-volkswagen-id4.jpg', width: 1280, height: 960,
    altKey: 'home_photos.alts.carplay', author: 'Sunnyboy122',
    title: '2023 Volkswagen ID.4 running wireless CarPlay',
    source: 'https://commons.wikimedia.org/wiki/File:2023_Volkswagen_ID.4_running_wireless_CarPlay.jpg',
    licence: 'CC0 1.0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  mercedes: {
    id: 'mercedes', src: '/images/home/mercedes-amg-gt.jpg', width: 1280, height: 1920,
    altKey: 'home_photos.alts.mercedes', author: 'Tayfun Kayabasi / Glasstuning',
    title: 'Glass tuning Mercedes AMG',
    source: 'https://commons.wikimedia.org/wiki/File:Glass_tuning_Mercedes_AMG.jpg',
    licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  exterior: {
    id: 'exterior', src: '/images/home/bmw-tuning-bodensee.jpg', width: 1280, height: 853,
    altKey: 'home_photos.alts.exterior', author: 'Matti Blume',
    title: 'Tuning World Bodensee 2018, Friedrichshafen (OW1A0278)',
    source: 'https://commons.wikimedia.org/wiki/File:Tuning_World_Bodensee_2018,_Friedrichshafen_(OW1A0278).jpg',
    licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
};

export const HOME_CATEGORY_PHOTOS = {
  performance: HOME_PHOTOS.exterior,
  interior: HOME_PHOTOS.cockpit,
  technology: HOME_PHOTOS.carplay,
};
