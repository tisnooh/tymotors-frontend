const STORAGE_KEY = 'ty_vehicle_selection';

const EMPTY_SELECTION = {
  brand: '',
  model: '',
  generation: '',
  year: '',
  body_type: '',
  trim: '',
  has_camera: null,
  has_parking_sensors: null,
};

function normalize(value = {}) {
  const year = String(value.year || '').replace(/\D/g, '').slice(0, 4);
  return {
    brand: String(value.brand || ''),
    model: String(value.model || ''),
    generation: String(value.generation || value.chassis || ''),
    year: year && Number(year) >= 1950 && Number(year) <= 2100 ? year : '',
    body_type: String(value.body_type || ''),
    trim: String(value.trim || '').slice(0, 100),
    has_camera: typeof value.has_camera === 'boolean' ? value.has_camera : null,
    has_parking_sensors: typeof value.has_parking_sensors === 'boolean' ? value.has_parking_sensors : null,
  };
}

export function readVehicleSelection() {
  if (typeof window === 'undefined') return { ...EMPTY_SELECTION };
  try {
    return normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch {
    return { ...EMPTY_SELECTION };
  }
}

export function saveVehicleSelection(value) {
  const selection = normalize(value);
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

