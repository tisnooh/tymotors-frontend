import { acceptedQuote, checkoutUrl, deliveryOptions, destinationInput, futureExpiry, quoteRequired, testCheckoutUrl } from './cartQuote';
import { cartFixture, checkoutFixture, destination, optionFixture, optionsFixture, quoteFixture, quoteId } from './__fixtures__/cartQuote';

test('only submitted allowlisted destination facts survive normalization', () => {
  expect(destinationInput({ ...destination, name: '  Client Test ', price: 1, mode: 'invented' })).toEqual(destination);
});
test.each([{ country: 'BE' }, { postal_code: '7500' }, { postal_code: 'ABCDE' }, { name: 'x' },
  { line1: 'x' }, { city: 'x' }, { phone: 'a\nb' }, { line2: 'x'.repeat(201) }])('invalid destination rejected (%j)', change => {
  expect(() => destinationInput({ ...destination, ...change })).toThrow();
});
test('exact server modes accepted; empty means unavailable, not free', () => {
  const payload = optionsFixture(); expect(deliveryOptions(payload)).toBe(payload.options);
  expect(deliveryOptions(optionsFixture([]))).toEqual([]);
});
test.each([
  { country: 'BE' }, { requires_quote: false }, { options: null },
  { options: [optionFixture(), optionFixture()] },
  { options: Array.from({ length: 11 }, (_, index) => optionFixture({ mode: `mode_${index}` })) },
  ...[{ mode: 'bad mode' }, { currency: 'USD' }, { shipping_cents: null }, { total_cents: 1 },
    { tax_cents: -1 }, { subtotal_cents: 0.5 }, { expires_at: new Date(0).toISOString() }].map(change => ({ options: [optionFixture(change)] })),
])('malformed options fail closed (%j)', change => {
  expect(() => deliveryOptions({ ...optionsFixture(), ...change })).toThrow();
});
test('verified quote must bind every current cart line and exact option amounts', () => {
  const quote = quoteFixture(); expect(acceptedQuote(quote, cartFixture(), optionFixture())).toBe(quote);
});
test('nonzero tax is already included in TTC totals, never added twice', () => {
  const option = optionFixture({ tax_cents: 1500 });
  const quote = quoteFixture({ tax_cents: 1500 });
  expect(deliveryOptions(optionsFixture([option]))).toEqual([option]);
  expect(acceptedQuote(quote, cartFixture(), option).total_cents).toBe(3500);
  expect(() => deliveryOptions(optionsFixture([optionFixture({ tax_cents: 1500, total_cents: 5000 })]))).toThrow();
  expect(() => deliveryOptions(optionsFixture([optionFixture({ tax_cents: 3501 })]))).toThrow();
});
test.each([{ quote_id: 'bad' }, { status: 'consumed' }, { country: 'BE' }, { mode: 'different' },
  { checkout_available: undefined }, { requires_revalidation: false }, { scope: 'payment' },
  { items: [] }, { items: [null] }, { items: [{ ...quoteFixture().items[0], quantity: 1 }] },
  { items: [{ ...quoteFixture().items[0], variant_id: quoteId }] },
  { items: [{ ...quoteFixture().items[0], unit_amount_cents: 1499 }] },
  { total_cents: 3600, shipping_cents: 600 }, { expires_at: new Date(0).toISOString() },
])('stale or inconsistent quote rejected (%j)', change => {
  expect(() => acceptedQuote(quoteFixture(change), cartFixture(), optionFixture())).toThrow();
});
test('duplicate cart identities cannot be hidden by duplicate quote lines', () => {
  const cart = cartFixture(); cart.items.push({ ...cart.items[0] });
  const quote = quoteFixture(); quote.items.push({ ...quote.items[0] });
  expect(() => acceptedQuote(quote, cart, optionFixture())).toThrow();
});
test('a different cart currency cannot be silently converted by an EUR quote', () => {
  expect(() => acceptedQuote(quoteFixture(), { ...cartFixture(), currency: 'USD' }, optionFixture())).toThrow();
});
test('only a linked Stripe test session URL is accepted', () => {
  expect(checkoutFixture().session_id).toContain('customer_fixture_');
  expect(testCheckoutUrl(checkoutFixture(), quoteId)).toBe(checkoutFixture().url);
});

test('server-approved production sessions use their exact live identity without changing sandbox restriction', () => {
  const live = checkoutFixture({ is_test: false, session_id: 'cs_live_fixture_123',
    url: 'https://checkout.stripe.com/c/pay/cs_live_fixture_123#opaque' });
  expect(checkoutUrl(live, quoteId)).toBe(live.url);
  expect(() => testCheckoutUrl(live, quoteId)).toThrow();
  expect(() => checkoutUrl({ ...live, is_test: true }, quoteId)).toThrow();
  expect(() => checkoutUrl({ ...checkoutFixture(), is_test: false }, quoteId)).toThrow();
});

test.each([undefined, null, 0, 'false'])('non-boolean mode cannot authorize a checkout (%j)', is_test => {
  expect(() => checkoutUrl(checkoutFixture({ is_test }), quoteId)).toThrow();
});
test.each([{ is_test: false }, { quote_id: 'other' }, { session_id: 'cs_live_123' },
  { url: 'https://checkout.stripe.com.evil.example/c/pay/cs_test_customer_fixture_123' },
  { url: 'https://checkout.stripe.com@evil.example/c/pay/cs_test_customer_fixture_123' },
  { url: 'https://checkout.stripe.com/c/pay/cs_test_other' },
  { url: 'http://checkout.stripe.com/c/pay/cs_test_customer_fixture_123' },
  { url: 'https://checkout.stripe.com:8443/c/pay/cs_test_customer_fixture_123' },
  { url: 'https://checkout.stripe.com/c/pay/cs_test_customer_fixture_123?redirect=elsewhere' },
  { status: 'paid' }, { order_id: 'bad' },
])('unsafe or unrelated checkout response rejected (%j)', change => {
  expect(() => testCheckoutUrl(checkoutFixture(change), quoteId)).toThrow();
});
test('expiry is timezone-aware, future and finite', () => {
  expect(() => futureExpiry('2026-10-25T12:00:00')).toThrow();
  expect(() => futureExpiry('not-a-date')).toThrow();
  expect(futureExpiry(optionFixture().expires_at)).toBeGreaterThan(Date.now());
});
test('variant or requires_quote never downgrades to legacy', () => {
  expect(quoteRequired(cartFixture())).toBe(true);
  expect(quoteRequired({ items: [{ variant_id: 'variant' }], shipping_status: 'ready' })).toBe(true);
  expect(quoteRequired({ items: [], shipping_status: 'requires_quote' })).toBe(true);
  expect(quoteRequired({ items: [{}], shipping_status: 'ready' })).toBe(false);
});
