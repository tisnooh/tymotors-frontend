import { normalizeVehicleSelection } from '@/lib/vehicleSelection';

export function vehiclePayload(selection) {
  const cleaned = normalizeVehicleSelection(selection);
  return {
    brand_slug: cleaned.brand, model: cleaned.model || null,
    chassis: (Object.prototype.hasOwnProperty.call(cleaned, 'chassis') ? cleaned.chassis : cleaned.generation) || null,
    generation: cleaned.generation || null,
    year: cleaned.year ? Number(cleaned.year) : null,
    body_type: cleaned.body_type || null, trim: cleaned.trim || null,
    facelift: cleaned.facelift || null,
    has_camera: cleaned.has_camera,
    has_parking_sensors: cleaned.has_parking_sensors,
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
    (['pre-lci', 'lci'].includes(rule.facelift) && rule.facelift !== vehicle.facelift) ||
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
