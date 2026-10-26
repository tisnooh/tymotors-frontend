import { api, Products, Cart, Checkout } from './api';

beforeEach(() => {
  jest.spyOn(api, 'get').mockResolvedValue({ data: { variants: [] } });
  jest.spyOn(api, 'post').mockResolvedValue({ data: { id: 'response' } });
});
afterEach(() => jest.restoreAllMocks());

test('variant discovery uses a product identity, without preview or selecting the first result', async () => {
  expect(await Products.variants('product/id')).toEqual({ variants: [] });
  expect(api.get).toHaveBeenCalledWith('/products/product%2Fid/variants');
});
test('quote forwards the destination and stable request identity to the authoritative server', async () => {
  const payload = { request_key: 'quote-request', mode: 'standard', destination: { country: 'FR', postal_code: '75001' } };
  expect(await Cart.quote(payload)).toEqual({ id: 'response' });
  expect(api.post).toHaveBeenCalledWith('/cart/quote', payload);
});
test('delivery discovery sends only the submitted destination, never an inferred shipping mode or amount', async () => {
  const destination = { name: 'Client Test', line1: '1 rue fictive', city: 'Paris', postal_code: '75001', country: 'FR' };
  await Cart.deliveryOptions(destination);
  expect(api.post).toHaveBeenCalledWith('/cart/delivery-options', { destination });
});
test('quoted checkout uses only the quote and request identities, not client prices or promotion URL', async () => {
  expect(await Checkout.createQuoted('quote/id', 'attempt-request')).toEqual({ id: 'response' });
  expect(api.post).toHaveBeenCalledWith('/cart/quote/quote%2Fid/checkout', { request_key: 'attempt-request' }, { timeout: 65000 });
});
test('a quoted checkout timeout propagates once without automatic payment retry', async () => {
  const error = Object.assign(new Error('timeout'), { code: 'ECONNABORTED' });
  api.post.mockRejectedValue(error);
  await expect(Checkout.createQuoted('quote-id', 'same-request')).rejects.toBe(error);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.defaults.timeout).toBe(30000);
});
