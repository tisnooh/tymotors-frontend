const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const modePattern = /^[A-Za-z0-9_-]{1,100}$/;
const fields = ['name', 'line1', 'line2', 'city', 'state', 'postal_code', 'country', 'phone'];
export const EMPTY_DESTINATION = Object.freeze({ name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'FR', phone: '' });
const invalid = () => { throw new Error('Les informations ont changé ou ne peuvent pas être vérifiées. Recalculez la livraison.'); };
export function destinationInput(values) {
  const result = Object.fromEntries(fields.map(field => [field, typeof values?.[field] === 'string' ? values[field].trim() : '']));
  if (result.country !== 'FR' || result.name.length < 2 || result.name.length > 160
      || result.line1.length < 3 || result.line1.length > 200 || result.line2.length > 200
      || result.city.length < 2 || result.city.length > 100 || result.state.length > 100 || result.phone.length > 40
      || !/^[0-9]{5}$/.test(result.postal_code) || Object.values(result).some(value => Array.from(value)
        .some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))) {
    throw new Error('Renseignez un nom et une adresse complète en France avec un code postal à cinq chiffres.');
  }
  return result;
}
export function secureRequestKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const text = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  return `${text.slice(0, 8)}-${text.slice(8, 12)}-${text.slice(12, 16)}-${text.slice(16, 20)}-${text.slice(20)}`;
}
export function quoteRequired(cart) {
  return cart.shipping_status === 'requires_quote' || cart.items.some(item => item.variant_id != null);
}
export function cartQuoteFingerprint(cart) {
  // In-memory only. Include fitment and server flags as well as line identities;
  // a refreshed catalogue/cart must never keep an earlier checkout approval.
  return JSON.stringify(cart);
}
export function futureExpiry(value, now = Date.now()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return invalid();
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time <= now) return invalid();
  return time;
}
function validAmounts(value) {
  const amounts = ['subtotal_cents', 'shipping_cents', 'tax_cents', 'total_cents'];
  if (value.currency !== 'EUR' || !amounts.every(field => Number.isSafeInteger(value[field]) && value[field] >= 0)
      // Catalogue and shipping amounts are TTC. Tax is an included component,
      // not an extra charge to add again (same contract as the quote engine).
      || value.subtotal_cents + value.shipping_cents !== value.total_cents
      || value.tax_cents > value.total_cents) return invalid();
}
export function deliveryOptions(response, now = Date.now()) {
  if (response?.country !== 'FR' || response.requires_quote !== true || !Array.isArray(response.options)
      || response.options.length > 10) return invalid();
  const modes = new Set();
  response.options.forEach(option => {
    if (!option || typeof option.mode !== 'string' || !modePattern.test(option.mode) || modes.has(option.mode)) return invalid();
    modes.add(option.mode); validAmounts(option); futureExpiry(option.expires_at, now);
  });
  return response.options;
}
export function acceptedQuote(quote, cart, option, now = Date.now()) {
  if (cart.currency !== 'EUR' || !quote || !uuid.test(quote.quote_id) || quote.status !== 'ready' || quote.country !== 'FR'
      || quote.mode !== option.mode || typeof quote.checkout_available !== 'boolean'
      || quote.requires_revalidation !== true || quote.scope !== 'persisted_quote_not_payment_or_reservation'
      || !Array.isArray(quote.items) || quote.items.length !== cart.items.length) return invalid();
  futureExpiry(quote.expires_at, now); futureExpiry(option.expires_at, now); validAmounts(quote);
  if (!['subtotal_cents', 'shipping_cents', 'tax_cents', 'total_cents', 'currency'].every(field => quote[field] === option[field])) return invalid();
  const expected = new Map();
  for (const item of cart.items) {
    if (!uuid.test(item.cart_item_id) || !uuid.test(item.product_id) || !uuid.test(item.variant_id)
        || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || expected.has(item.cart_item_id)) return invalid();
    expected.set(item.cart_item_id, item);
  }
  let subtotal = 0;
  for (const item of quote.items) {
    const original = expected.get(item?.cart_item_id);
    if (!original || original.product_id !== item.product_id || original.variant_id !== item.variant_id
        || original.quantity !== item.quantity || !Number.isSafeInteger(item.unit_amount_cents) || item.unit_amount_cents < 0) return invalid();
    expected.delete(item.cart_item_id); subtotal += item.unit_amount_cents * item.quantity;
  }
  if (expected.size || !Number.isSafeInteger(subtotal) || subtotal !== quote.subtotal_cents) return invalid();
  return quote;
}
export function testCheckoutUrl(response, quoteId) {
  if (response?.is_test !== true || response.quote_id !== quoteId || response.status !== 'open'
      || !uuid.test(response.order_id) || typeof response.session_id !== 'string'
      || !/^cs_test_[A-Za-z0-9_]{1,240}$/.test(response.session_id) || typeof response.url !== 'string') return invalid();
  let url;
  try { url = new URL(response.url); } catch { return invalid(); }
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.port
      || url.username || url.password || url.pathname !== `/c/pay/${response.session_id}` || url.search) return invalid();
  return url.href;
}
