// Synthetic local test data only. These are not a catalogue offer or tariff.
export const productId = '10000000-0000-4000-8000-000000000001';
export const variantId = '10000000-0000-4000-8000-000000000002';
export const lineId = '10000000-0000-4000-8000-000000000003';
export const quoteId = '10000000-0000-4000-8000-000000000004';
export const orderId = '10000000-0000-4000-8000-000000000005';
export const destination = { name: 'Client Test', line1: '1 rue fictive', line2: '', city: 'Paris', state: '', postal_code: '75001', country: 'FR', phone: '' };
export const cartFixture = () => ({ items: [{ product_id: productId, variant_id: variantId, cart_item_id: lineId,
  quantity: 2, price: 15, name: 'Pièce de test', slug: 'piece-test', max_order_quantity: 10 }],
  currency: 'EUR', subtotal: 30, shipping: null, total: null, shipping_status: 'requires_quote', checkout_available: false });
export const optionFixture = (overrides = {}) => ({ mode: 'verified_test_mode', currency: 'EUR', subtotal_cents: 3000,
  shipping_cents: 500, tax_cents: 0, total_cents: 3500, expires_at: new Date(Date.now() + 180000).toISOString(), ...overrides });
export const optionsFixture = (options = [optionFixture()]) => ({ country: 'FR', requires_quote: true, options });
export const quoteFixture = (overrides = {}) => ({ ...optionFixture(), quote_id: quoteId, status: 'ready', country: 'FR',
  checkout_available: true, requires_revalidation: true, scope: 'persisted_quote_not_payment_or_reservation',
  items: [{ cart_item_id: lineId, product_id: productId, variant_id: variantId, quantity: 2, unit_amount_cents: 1500 }], ...overrides });
export const checkoutFixture = (overrides = {}) => ({ order_id: orderId, quote_id: quoteId, status: 'open', is_test: true,
  session_id: 'cs_test_customer_fixture_123', url: 'https://checkout.stripe.com/c/pay/cs_test_customer_fixture_123#test', ...overrides });
