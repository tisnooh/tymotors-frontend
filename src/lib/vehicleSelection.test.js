import { clearVehicleSelection, normalizeVehicleSelection, readVehicleSelection, saveVehicleSelection } from './vehicleSelection';
import { vehiclePayload } from '@/pages/customize/project';

const facts = {
  brand: 'bmw', model: 'Série 3', generation: 'F30', year: '2016',
  body_type: 'Berline', trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: true,
};
beforeEach(() => localStorage.clear());

test('all vehicle facts survive storage and API round trips, without display metadata', () => {
  saveVehicleSelection({ ...facts, compatibility_status: 'compatible', compatibility_reason: 'Untrusted display', sku: 'NOT-A-VEHICLE' });
  expect(readVehicleSelection()).toEqual(facts);
  const api = vehiclePayload(readVehicleSelection());
  expect(api).toEqual({ brand_slug: 'bmw', model: 'Série 3', chassis: 'F30', generation: 'F30', year: 2016,
    body_type: 'Berline', trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: true });
  saveVehicleSelection({ ...api, compatibility_status: 'compatible' });
  expect(readVehicleSelection()).toEqual({ ...facts, chassis: 'F30' });
  expect(Object.keys(JSON.parse(localStorage.getItem('ty_vehicle_selection'))).sort()).toEqual([...Object.keys(facts), 'chassis'].sort());
});

test.each([true, false, null])('equipment %j is not confused with unknown or truthy strings', value => {
  saveVehicleSelection({ ...facts, has_camera: value, has_parking_sensors: value });
  expect(vehiclePayload(readVehicleSelection())).toMatchObject({ has_camera: value, has_parking_sensors: value });
});

test.each(['pre-lci', 'lci', 'unknown'])('phase %s is preserved without inferring it from the year', facelift => {
  saveVehicleSelection({ ...facts, facelift });
  expect(readVehicleSelection().facelift).toBe(facelift);
  expect(vehiclePayload(readVehicleSelection()).facelift).toBe(facelift);
});

test('unknown values are explicit nulls in the API and invalid input is not promoted to facts', () => {
  const selection = normalizeVehicleSelection({ brand_slug: 'bmw', chassis: 'F30', year: '20x16', facelift: 'any',
    model: {}, body_type: null, trim: null, has_camera: 'false', has_parking_sensors: 1 });
  expect(vehiclePayload(selection)).toEqual({ brand_slug: 'bmw', model: null, chassis: 'F30', generation: 'F30',
    year: null, body_type: null, trim: null, facelift: null, has_camera: null, has_parking_sensors: null });
});

test.each([null, [], 7, 'not-json', '{broken'])('invalid storage %j is safely reset', input => {
  localStorage.setItem('ty_vehicle_selection', typeof input === 'string' ? input : JSON.stringify(input));
  expect(readVehicleSelection()).toEqual(normalizeVehicleSelection());
});

test('text is bounded and normalized and clearing removes every saved detail', () => {
  saveVehicleSelection({ ...facts, brand: ' bmw ', trim: ` ${'T'.repeat(110)} ` });
  expect(readVehicleSelection()).toMatchObject({ brand: 'bmw', trim: 'T'.repeat(100) });
  clearVehicleSelection();
  expect(readVehicleSelection()).toEqual(normalizeVehicleSelection());
});

test('explicit chassis and generation stay distinct throughout storage and API conversion', () => {
  const selected = { ...facts, chassis: 'F30', generation: 'F30 phase 2' };
  saveVehicleSelection(selected);
  expect(readVehicleSelection()).toEqual(selected);
  expect(vehiclePayload(readVehicleSelection())).toMatchObject({ chassis: 'F30', generation: 'F30 phase 2' });
  saveVehicleSelection(vehiclePayload(readVehicleSelection()));
  expect(readVehicleSelection()).toEqual(selected);
});

test.each([null, ''])('an explicitly unknown chassis %j is not filled with a generation label', chassis => {
  saveVehicleSelection({ ...facts, generation: 'F30 phase 2', chassis });
  expect(vehiclePayload(readVehicleSelection())).toMatchObject({ chassis: null, generation: 'F30 phase 2' });
});
