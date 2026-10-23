const STORAGE_KEY = 'ty_vehicle_selection';

const EMPTY_SELECTION = {
  brand: '',
  model: '',
  generation: '',
  year: '',
  body_type: '',
  trim: '',
  facelift: '',
  has_camera: null,
  has_parking_sensors: null,
};

export function normalizeVehicleSelection(value = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const text = (input, limit) => typeof input === 'string' ? input.trim().slice(0, limit) : '';
  const year = String(source.year ?? '').trim();
  const brand = text(source.brand ?? source.brand_slug, 100);
  return {
    brand: /^[a-z0-9-]+$/.test(brand) ? brand : '',
    model: text(source.model, 100),
    generation: text(source.generation || source.chassis, 100),
    ...(Object.prototype.hasOwnProperty.call(source, 'chassis') ? { chassis: text(source.chassis, 50) } : {}),
    year: /^\d{4}$/.test(year) && Number(year) >= 1950 && Number(year) <= 2100 ? year : '',
    body_type: text(source.body_type, 100),
    trim: text(source.trim, 100),
    facelift: ['pre-lci', 'lci', 'unknown'].includes(source.facelift) ? source.facelift : '',
    has_camera: typeof source.has_camera === 'boolean' ? source.has_camera : null,
    has_parking_sensors: typeof source.has_parking_sensors === 'boolean' ? source.has_parking_sensors : null,
  };
}

export function readVehicleSelection() {
  if (typeof window === 'undefined') return { ...EMPTY_SELECTION };
  try {
    return normalizeVehicleSelection(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch {
    return { ...EMPTY_SELECTION };
  }
}

export function saveVehicleSelection(value) {
  const selection = normalizeVehicleSelection(value);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // Browsing can continue when storage is unavailable or full.
    }
  }
  return selection;
}

export function clearVehicleSelection() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Browsing can continue when storage is unavailable.
    }
  }
}

