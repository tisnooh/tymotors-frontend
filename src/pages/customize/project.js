export function vehiclePayload(selection) {
  const year = Number(selection.year);
  return {
    brand_slug: selection.brand, model: selection.model, chassis: selection.generation,
    generation: selection.generation,
    year: selection.year && Number.isInteger(year) && year >= 1950 && year <= 2100 ? year : null,
    body_type: selection.body_type || null, trim: selection.trim || null,
    has_camera: selection.has_camera ?? null,
    has_parking_sensors: selection.has_parking_sensors ?? null,
  };
}

// A catalogue filter is never a compatibility confirmation.
export function checkedFit(result, vehicle) {
  if (!['compatible', 'confirm', 'unknown', 'incompatible'].includes(result?.status)) return 'unknown';
  if (result.status !== 'compatible') return result.status;
  const rule = result.compatibility || {};
  if (!vehicle.year || !vehicle.model || !vehicle.chassis ||
    (rule.body_types?.length && !vehicle.body_type) ||
    ((rule.required_trim?.length || rule.excluded_trims?.length) && !vehicle.trim) ||
    (rule.camera_compatible === false && vehicle.has_camera == null) ||
    (rule.parking_sensor_compatible === false && vehicle.has_parking_sensors == null)) return 'confirm';
  return 'compatible';
}

export function availableForProject(product) {
  return product.status === 'active' && product.purchase_available === true &&
    !product.test_purchase && Number.isFinite(product.price) && product.price >= 0 &&
    product.stock > 0 && product.max_order_quantity > 0;
}

export function projectTotals(items) {
  return items.reduce((totals, { product }) => {
    const currency = product.currency || 'EUR';
    if (Number.isFinite(product.price)) totals[currency] = (totals[currency] || 0) + Math.round(product.price * 100);
    return totals;
  }, {});
}
