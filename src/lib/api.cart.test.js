import { api, Cart } from './api';

const product = '10000000-0000-4000-8000-000000000001';
const variant = '10000000-0000-4000-8000-000000000002';
const line = '10000000-0000-4000-8000-000000000003';
const response = { items: [{ id: product, product_id: product, cart_item_id: line, variant_id: variant }], shipping: null, total: null };
beforeEach(() => {
  jest.spyOn(api, 'post').mockResolvedValue({ data: response });
  jest.spyOn(api, 'put').mockResolvedValue({ data: response });
  jest.spyOn(api, 'delete').mockResolvedValue({ data: response });
});
afterEach(() => jest.restoreAllMocks());

test('add sends the exact optional variant and vehicle facts without display-only compatibility labels', async () => {
  const facts = { brand_slug: 'bmw', model: 'Série 3', chassis: 'F30', generation: 'F30 phase 2', year: 2016,
    body_type: 'Berline', trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: null };
  const result = await Cart.add(product, 2, { ...facts, compatibility_status: 'compatible', compatibility_reason: 'Not a fact', price: 1 }, variant);
  expect(api.post).toHaveBeenCalledWith('/cart', { product_id: product, quantity: 2, selected_vehicle: facts, variant_id: variant });
  expect(result).toBe(response);
});

test.each([undefined, null])('legacy add omits a missing variant %j and retains the previous default payload', async variantId => {
  await Cart.add(product, undefined, undefined, variantId);
  expect(api.post).toHaveBeenCalledWith('/cart', { product_id: product, quantity: 1, selected_vehicle: null });
});

test('update and remove target a cart line without substituting its product identity', async () => {
  expect(await Cart.update(product, 3, line)).toBe(response);
  expect(api.put).toHaveBeenCalledWith('/cart', { product_id: product, quantity: 3, cart_item_id: line });
  expect(await Cart.remove(product, line)).toBe(response);
  expect(api.delete).toHaveBeenCalledWith(`/cart/${product}`, { params: { cart_item_id: line } });
});

test.each([undefined, null])('legacy update/remove omit line identifier %j entirely', async cartItemId => {
  await Cart.update(product, 0, cartItemId);
  expect(api.put).toHaveBeenCalledWith('/cart', { product_id: product, quantity: 0 });
  await Cart.remove(product, cartItemId);
  expect(api.delete.mock.calls).toEqual([[`/cart/${product}`]]);
});
