import { assertVariantSaved, CartVariantError, selectCartVariant } from './cartVariant';

const product = '10000000-0000-4000-8000-000000000001';
const first = '10000000-0000-4000-8000-000000000002';
const second = '10000000-0000-4000-8000-000000000003';
const variant = (id = first, overrides = {}) => ({ id, product_id: product, sku: 'EXACT', status: 'active', is_verified: true, ...overrides });
const response = (variants = [variant()], overrides = {}) => ({ product_id: product, requires_quote: true, variants, ...overrides });
const errorCode = (payload, requested) => {
  try { selectCartVariant(product, payload, requested); throw new Error('expected rejection'); }
  catch (error) { expect(error).toBeInstanceOf(CartVariantError); expect(error.response.status).toBe(409); return error.code; }
};

test.each([undefined, null])('only one current eligible variant can be resolved without a selection (%j)', missing => {
  expect(selectCartVariant(product, response(), missing)).toBe(first);
});
test('an explicit variant is matched by identity, never position', () => {
  const payload = response([variant(), variant(second)]);
  expect(selectCartVariant(product, payload, second)).toBe(second);
  expect(errorCode(payload)).toBe('VARIANT_SELECTION_REQUIRED');
});
test.each([[], [variant(first, { is_verified: false })], [variant(first, { status: 'draft' })],
  [variant(first, { sku: '' })]].map(variants => [variants]))('no eligible variant is never downgraded (%j)', variants => {
  expect(errorCode(response(variants))).toBe('VARIANT_UNAVAILABLE');
});
test('no per-variant test flag is invented or required', () => {
  const payload = response();
  expect(payload.variants[0]).not.toHaveProperty('is_test');
  expect(selectCartVariant(product, payload)).toBe(first);
});
test.each([second, 'not-a-uuid', '', 123])('an unavailable explicit identity is rejected (%j)', requested => {
  expect(errorCode(response(), requested)).toBe('VARIANT_UNAVAILABLE');
});
test('an explicit unverified variant is not replaced with a different eligible one', () => {
  expect(errorCode(response([variant(), variant(second, { is_verified: false })]), second)).toBe('VARIANT_UNAVAILABLE');
});
test.each([
  null, {}, response(null), response([], { product_id: second }), response([], { requires_quote: false }),
  response([variant(), variant()]), response([variant(first, { product_id: second })]), response([null]), response([variant('bad')]),
])('malformed or foreign public response fails closed (%j)', payload => {
  expect(errorCode(payload)).toBe('INVALID_VARIANT_RESPONSE');
});
test('valid resolution does not mutate server data or infer a vehicle/finish', () => {
  const entry = Object.freeze(variant(first, { attributes: Object.freeze({ finish: 'black' }) }));
  const payload = Object.freeze(response(Object.freeze([entry])));
  expect(selectCartVariant(product, payload)).toBe(first);
  expect(entry.attributes).toEqual({ finish: 'black' });
});
test.each([null, {}, { items: [] }, { items: [{ product_id: product, quantity: 1 }] },
  { items: [{ product_id: product, variant_id: second, quantity: 1 }] },
  { items: [{ product_id: second, variant_id: first, quantity: 1 }] },
  { items: [{ product_id: product, variant_id: first, quantity: 0 }] },
])('an ignored or unconfirmed variant is never reported as saved (%j)', cart => {
  expect(() => assertVariantSaved(product, first, cart)).toThrow(CartVariantError);
  try { assertVariantSaved(product, first, cart); } catch (error) { expect(error.code).toBe('CART_VARIANT_NOT_CONFIRMED'); }
});
test('only the exact persisted variant in the server cart confirms success', () => {
  const cart = { items: [{ product_id: product, variant_id: first, quantity: 1 }] };
  expect(assertVariantSaved(product, first, cart)).toBe(cart);
});
test('confirmed quantity must cover the requested addition', () => {
  const cart = { items: [{ product_id: product, variant_id: first, quantity: 1 }] };
  expect(() => assertVariantSaved(product, first, cart, 2)).toThrow(CartVariantError);
});
test('selected vehicle facts including false/null must be preserved, not display-only claims', () => {
  const vehicle = { brand_slug: 'bmw', chassis: 'F30', has_camera: false, has_parking_sensors: null };
  const cart = actual => ({ items: [{ product_id: product, variant_id: first, quantity: 2, selected_vehicle: actual }] });
  expect(assertVariantSaved(product, first, cart({ ...vehicle, compatibility_status: 'compatible' }), 1, vehicle)).toBeTruthy();
  expect(() => assertVariantSaved(product, first, cart({ ...vehicle, chassis: 'F32' }), 1, vehicle)).toThrow(CartVariantError);
  expect(() => assertVariantSaved(product, first, cart({ ...vehicle, has_camera: true }), 1, vehicle)).toThrow(CartVariantError);
  expect(() => assertVariantSaved(product, first, cart(null), 1, vehicle)).toThrow(CartVariantError);
  expect(() => assertVariantSaved(product, first, cart(vehicle), 1, null)).toThrow(CartVariantError);
});

test('unspecified vehicle fields mean null, not a different existing model year or trim', () => {
  const vehicle = { brand_slug: 'bmw', chassis: 'F30' };
  const cart = actual => ({ items: [{ product_id: product, variant_id: first, quantity: 1, selected_vehicle: actual }] });
  expect(() => assertVariantSaved(product, first, cart({ ...vehicle, year: 2020, trim: 'X' }), 1, vehicle)).toThrow(CartVariantError);
  expect(assertVariantSaved(product, first, cart({ ...vehicle, year: null, trim: null }), 1, vehicle)).toBeTruthy();
});

test('a cached pre-add quantity does not confirm an increment that never happened', () => {
  const previous = { items: [{ product_id: product, variant_id: first, quantity: 2 }] };
  expect(() => assertVariantSaved(product, first, previous, 1, null, previous)).toThrow(CartVariantError);
  expect(assertVariantSaved(product, first, { items: [{ ...previous.items[0], quantity: 3 }] }, 1, null, previous)).toBeTruthy();
});
