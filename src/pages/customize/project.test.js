import { checkedFit, vehiclePayload } from './project';

const selection = { brand: 'bmw', model: 'Série 3', generation: 'F30', year: '2016', facelift: 'lci', has_camera: false };

test.each([null, undefined, '', 'unknown', 'pre-lci'])('missing or wrong phase %j cannot authorize an LCI rule', facelift => {
  const result = { status: 'compatible', compatibility: { facelift: 'lci' } };
  expect(checkedFit(result, vehiclePayload({ ...selection, facelift }))).toBe('confirm');
});

test('a precise matching phase remains eligible, not a new fitment validation', () => {
  expect(checkedFit({ status: 'compatible', compatibility: { facelift: 'lci' } }, vehiclePayload(selection))).toBe('compatible');
  expect(checkedFit({ status: 'confirm', compatibility: { facelift: 'lci' } }, vehiclePayload(selection))).toBe('confirm');
});
