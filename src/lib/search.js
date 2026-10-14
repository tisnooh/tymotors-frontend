export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 120;
export const SEARCH_PREVIEW_LIMIT = 8;
export const SEARCH_DEBOUNCE_MS = 220;

export function normalizeSearchQuery(value = '') {
  return Array.from(String(value).trim()).slice(0, SEARCH_MAX_LENGTH).join('');
}

export function searchCatalogueUrl(value) {
  const query = normalizeSearchQuery(value);
  return query ? `/shop?${new URLSearchParams({ q: query })}` : '/shop';
}
