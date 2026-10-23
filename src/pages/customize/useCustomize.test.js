import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useVehicleSelection } from './useCustomize';
import { readVehicleSelection, saveVehicleSelection } from '@/lib/vehicleSelection';
import { Compatibility } from '@/lib/api';

jest.mock('@/lib/api', () => ({ Compatibility: { list: jest.fn() } }));
let root, state;
const facts = { brand: 'bmw', model: 'Série 3', generation: 'F30', year: '2016', body_type: 'Berline',
  trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: false };
function Probe() { state = useVehicleSelection(); return null; }
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  Compatibility.list.mockResolvedValue([]);
  root = createRoot(document.createElement('div'));
});
afterEach(() => { act(() => root.unmount()); jest.clearAllMocks(); });

test('configurator restores and resaves every vehicle fact, including phase and false', async () => {
  saveVehicleSelection(facts);
  await act(async () => root.render(<Probe />));
  expect(state.details).toEqual({ year: '2016', body_type: 'Berline', trim: 'M Sport', facelift: 'lci', has_camera: false, has_parking_sensors: false });
  expect(readVehicleSelection()).toEqual(facts);
  act(() => state.setDetails(current => ({ ...current, year: '2017' })));
  expect(readVehicleSelection()).toEqual({ ...facts, year: '2017' });
  act(() => state.setDetails(current => ({ ...current, has_camera: null })));
  expect(readVehicleSelection()).toMatchObject({ facelift: 'lci', has_camera: null, has_parking_sensors: false });
});

test.each(['setBrand', 'setModel', 'setGeneration'])('%s clears every dependent detail instead of reusing a previous vehicle phase', async setter => {
  saveVehicleSelection(facts);
  await act(async () => root.render(<Probe />));
  await act(async () => state[setter](setter === 'setGeneration' ? 'G20' : 'other'));
  expect(state.details).toEqual({ year: '', body_type: '', trim: '', facelift: '', has_camera: null, has_parking_sensors: null });
  expect(readVehicleSelection()).toMatchObject(state.details);
});

test('configurator keeps a distinct saved chassis until the generation changes', async () => {
  const saved = { ...facts, chassis: 'F30', generation: 'F30 phase 2' };
  saveVehicleSelection(saved);
  await act(async () => root.render(<Probe />));
  expect(readVehicleSelection()).toEqual(saved);
  act(() => state.setDetails(current => ({ ...current, has_camera: null })));
  expect(readVehicleSelection()).toMatchObject({ chassis: 'F30', generation: 'F30 phase 2', has_camera: null });
  act(() => state.setGeneration('G20'));
  expect(readVehicleSelection()).not.toHaveProperty('chassis');
  expect(readVehicleSelection().generation).toBe('G20');
});
