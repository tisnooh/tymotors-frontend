export function formatPrice(value, currency = 'EUR', locale = 'en-EU') {
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-EU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return `\u20ac${Math.round(value)}`;
  }
}

export function getLocale(i18nLng) {
  return i18nLng?.startsWith('fr') ? 'fr-FR' : 'en-EU';
}
