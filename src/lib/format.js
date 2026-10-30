export function formatPrice(value, currency = 'EUR', locale = 'en-EU') {
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-EU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    return `\u20ac${Number(value).toFixed(2).replace(/\.00$/, '')}`;
  }
}

export function getLocale(i18nLng) {
  return i18nLng?.startsWith('fr') ? 'fr-FR' : 'en-EU';
}
