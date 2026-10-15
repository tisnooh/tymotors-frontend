import fs from 'node:fs';
import path from 'node:path';
import { catalogueCategory, vehicleViewSet, VIEW_CATEGORIES, REVIEWED_VEHICLES } from './vehicleViews';

const vehicle = { brand: 'mercedes-benz', model: 'Classe A', generation: 'W177', year: '2020', body_type: 'Compacte', trim: 'AMG Line' };

test('only reviewed W177 category assets are linked and delivered as real WebP files', () => {
  const views = vehicleViewSet(vehicle);
  for (const category of VIEW_CATEGORIES) {
    expect(views[category].src).toContain('/images/customize/w177/');
    const bytes = fs.readFileSync(path.join(process.cwd(), 'public', views[category].src));
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    expect(bytes.length).toBeLessThan(500000);
  }
  expect(vehicleViewSet({ ...vehicle, year: '', body_type: '', trim: '' })).not.toBeNull();
});

test.each([
  { brand: 'bmw' }, { model: 'Classe C' }, { generation: 'W176' },
  { year: '2023' }, { year: '2017' }, { year: 'invalid' }, { year: '2020.5' },
  { body_type: 'Berline' }, { body_type: 'Coupé' }, { trim: 'Progressive' }, { trim: 'A45 AMG' },
])('never borrows W177 imagery for a mismatching vehicle: %j', change => {
  expect(vehicleViewSet({ ...vehicle, ...change })).toBeNull();
});

test('hotspot aliases map to catalogue categories and unsupported ones remain all', () => {
  expect(catalogueCategory('exterior')).toBe('performance');
  expect(catalogueCategory('multimedia-technology')).toBe('technology');
  expect(catalogueCategory('interior')).toBe('interior');
  expect(catalogueCategory('unreviewed-category')).toBe('all');
});

test.each(REVIEWED_VEHICLES)('$vehicle has three distinct, real, lightweight reviewed images', entry => {
  const views = vehicleViewSet(entry);
  expect(views).not.toBeNull();
  expect(new Set(VIEW_CATEGORIES.map(category => views[category].src)).size).toBe(3);
  for (const category of VIEW_CATEGORIES) {
    expect(views[category].src).toContain(`/images/customize/${entry.id}/`);
    const bytes = fs.readFileSync(path.join(process.cwd(), 'public', views[category].src));
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    expect(bytes.length).toBeGreaterThan(20000);
    expect(bytes.length).toBeLessThan(500000);
  }
  expect(vehicleViewSet({ ...entry, year: String(entry.year), body_type: entry.bodies[0], trim: entry.trims[0] || '' })).toBe(views);
  expect(vehicleViewSet({ ...entry, year: '', body_type: '', trim: '' })).toBe(views);
  for (const language of ['fr', 'en']) {
    const project = require(`@/lib/locales/${language}.json`).customize.project;
    expect(project[views.noteKey.split('.').at(-1)]).toBeTruthy();
    for (const category of VIEW_CATEGORIES) expect(project[views[category].altKey.split('.').at(-1)]).toBeTruthy();
  }
});

test.each(REVIEWED_VEHICLES)('$vehicle rejects unreviewed years, bodies and trims rather than borrowing a cabin', entry => {
  for (const year of ['invalid', '2020.5', String(entry.years[0] - 1), String(entry.years[1] + 1)]) {
    expect(vehicleViewSet({ ...entry, year })).toBeNull();
  }
  expect(vehicleViewSet({ ...entry, body_type: 'Cabriolet' })).toBeNull();
  expect(vehicleViewSet({ ...entry, trim: 'Unreviewed special edition' })).toBeNull();
  expect(vehicleViewSet({ ...entry, generation: 'different generation' })).toBeNull();
});

test('all 14 generation groups have isolated assets; unknown models remain pending', () => {
  expect(REVIEWED_VEHICLES).toHaveLength(13);
  const urls = [vehicle, ...REVIEWED_VEHICLES].flatMap(entry => VIEW_CATEGORIES.map(category => vehicleViewSet(entry)[category].src));
  expect(new Set(urls).size).toBe(42);
  expect(vehicleViewSet({ brand: 'bmw', model: 'Serie 3', generation: 'F30/F35' })).not.toBeNull();
  for (const entry of [
    { brand: 'audi', model: 'A5', generation: '' },
    { brand: 'porsche', model: 'Boxster', generation: '' },
    { brand: 'porsche', model: 'Cayman', generation: '' },
    { brand: 'toyota', model: 'GR86 / GT86', generation: '' },
    { brand: 'toyota', model: '911', generation: '992' },
  ]) expect(vehicleViewSet(entry)).toBeNull();
});

test.each(['bmw-g20', 'audi-a3-8v', 'porsche-991'])('%s uses the phase-corrected exterior without replacing its cabin', id => {
  const entry = REVIEWED_VEHICLES.find(item => item.id === id);
  const views = vehicleViewSet(entry);
  expect(views.performance.src).toBe(`/images/customize/${id}/exterior-v2.webp`);
  expect(views.interior.src).toBe(`/images/customize/${id}/interior-v1.webp`);
  expect(views.technology.src).toBe(`/images/customize/${id}/technology-v1.webp`);
});
