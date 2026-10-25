// A displayed product is not a purchasable variant. Resolve identities from the
// current public server response; never infer a finish or fall back to legacy.
export class CartVariantError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'CartVariantError';
    this.code = code;
    // Existing callers may display API error details without special rendering.
    this.response = { status: 409, data: { detail: message, code } };
  }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (code, message) => { throw new CartVariantError(code, message); };

export function selectCartVariant(productId, response, requestedVariantId) {
  if (typeof productId !== 'string' || !uuid.test(productId)
      || response?.product_id !== productId || response.requires_quote !== true
      || !Array.isArray(response.variants)) {
    return fail('INVALID_VARIANT_RESPONSE', 'Les variantes de cet article ne peuvent pas être vérifiées.');
  }
  const seen = new Set();
  for (const variant of response.variants) {
    if (!variant || typeof variant.id !== 'string' || !uuid.test(variant.id)
        || variant.product_id !== productId || seen.has(variant.id)) {
      return fail('INVALID_VARIANT_RESPONSE', 'Les variantes de cet article ne peuvent pas être vérifiées.');
    }
    seen.add(variant.id);
  }
  const eligible = response.variants.filter(variant => variant.status === 'active'
    && variant.is_verified === true
    && typeof variant.sku === 'string' && variant.sku.trim().length > 0);
  if (requestedVariantId != null) {
    if (typeof requestedVariantId !== 'string' || !uuid.test(requestedVariantId)
        || !eligible.some(variant => variant.id === requestedVariantId)) {
      return fail('VARIANT_UNAVAILABLE', 'La variante sélectionnée n’est pas disponible pour cet article.');
    }
    return requestedVariantId;
  }
  if (eligible.length === 0) {
    return fail('VARIANT_UNAVAILABLE', 'Aucune variante vérifiée n’est disponible pour cet article.');
  }
  if (eligible.length !== 1) {
    return fail('VARIANT_SELECTION_REQUIRED', 'Choisissez une variante précise avant d’ajouter cet article au panier.');
  }
  return eligible[0].id;
}

const vehicleFields = ['brand_slug', 'model', 'chassis', 'generation', 'year', 'body_type',
  'facelift', 'trim', 'has_camera', 'has_parking_sensors'];

export function assertVariantSaved(productId, variantId, cart, quantity = 1, vehicle = null, previousCart = null) {
  const sameVehicle = actual => vehicle == null ? actual == null : actual != null
    && vehicleFields.every(field => (vehicle[field] ?? null) === (actual[field] ?? null));
  const matches = item => item?.product_id === productId && item.variant_id === variantId
    && sameVehicle(item.selected_vehicle);
  const before = (previousCart?.items || []).filter(matches)
    .reduce((sum, item) => sum + (Number.isInteger(item.quantity) ? item.quantity : 0), 0);
  if (!Array.isArray(cart?.items) || !cart.items.some(item => matches(item)
      && Number.isInteger(item.quantity) && Number.isInteger(quantity)
      && quantity > 0 && item.quantity >= before + quantity)) {
    // A write may already have happened. Do not retry or attempt a blind rollback;
    // the caller must inspect/refresh the server cart before another decision.
    return fail('CART_VARIANT_NOT_CONFIRMED', 'La variante ajoutée n’a pas été confirmée. Vérifiez votre panier avant de réessayer.');
  }
  return cart;
}
